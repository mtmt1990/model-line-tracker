import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { PartModel, LineMaster, DEFAULT_LINES } from '@/types';

export interface ParseResult {
  items: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[];
  errors: string[];
  totalRows: number;
}

// 動的なライン名の正規化 (Line 1〜8, 11〜17, その他任意のライン名)
export const normalizeLines = (rawInput: unknown, knownLines: LineMaster[] = DEFAULT_LINES): string[] => {
  if (!rawInput) return [];
  if (Array.isArray(rawInput)) {
    return rawInput.map((l) => normalizeSingleLine(String(l), knownLines)).filter(Boolean) as string[];
  }

  const str = String(rawInput);
  const parts = str.split(/[,、/／;；\n\r\t]+/).map((s) => s.trim()).filter(Boolean);
  const result: string[] = [];

  for (const part of parts) {
    const normalized = normalizeSingleLine(part, knownLines);
    if (normalized && !result.includes(normalized)) {
      result.push(normalized);
    }
  }

  return result;
};

const normalizeSingleLine = (str: string, knownLines: LineMaster[]): string | null => {
  const clean = str.trim();
  if (!clean) return null;

  const exact = knownLines.find((l) => l.id.toLowerCase() === clean.toLowerCase() || l.name.toLowerCase() === clean.toLowerCase());
  if (exact) return exact.id;

  const numMatch = clean.match(/\b([0-9]{1,3})\b/);
  if (numMatch) {
    const num = numMatch[1];
    const matchById = knownLines.find((l) => l.id === `Line ${num}` || l.name.includes(num));
    if (matchById) return matchById.id;
    return `Line ${num}`;
  }

  const lineMatch = clean.match(/(?:line|ライン|L)\s*([0-9a-zA-Z_-]+)/i);
  if (lineMatch) {
    const target = `Line ${lineMatch[1]}`;
    const matched = knownLines.find((l) => l.id.toLowerCase() === target.toLowerCase());
    if (matched) return matched.id;
    return target;
  }

  return clean;
};

// 汎用オブジェクト行からPartModelオブジェクトを抽出
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseRawRow = (row: Record<string, any>, knownLines: LineMaster[] = DEFAULT_LINES): Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'> | null => {
  const keys = Object.keys(row);
  if (keys.length === 0) return null;

  // 型番の特定
  const partNumberKey = keys.find((k) =>
    /^(型番|品番|型式|part|part_?no|part_?number|model_?no|item_?code)/i.test(k.trim())
  );
  // 車種の特定
  const vehicleKey = keys.find((k) =>
    /^(車種|車名|車両|vehicle|vehicle_?model|car|car_?model)/i.test(k.trim())
  );
  // 備考の特定
  const notesKey = keys.find((k) =>
    /^(備考|特記|メモ|コメント|note|notes|remark|memo)/i.test(k.trim())
  );
  // 状態の特定
  const statusKey = keys.find((k) =>
    /^(状態|ステータス|status)/i.test(k.trim())
  );

  const partNumber = partNumberKey ? String(row[partNumberKey] || '').trim() : '';
  const vehicleModel = vehicleKey ? String(row[vehicleKey] || '').trim() : '';

  if (!partNumber || !vehicleModel) {
    return null;
  }

  // 流動ラインの特定
  const singleLineKey = keys.find((k) =>
    /^(流動ライン|流動可能ライン|対応ライン|生産ライン|ライン|lines|line|flow_?lines)/i.test(k.trim())
  );

  let lines: string[] = [];

  if (singleLineKey && row[singleLineKey] !== undefined && row[singleLineKey] !== '') {
    lines = normalizeLines(row[singleLineKey], knownLines);
  } else {
    const isAffirmative = (val: unknown) => {
      if (val === true || val === 1 || val === '1' || val === '○' || val === '〇' || val === 'O' || val === 'o' || val === 'TRUE' || val === 'true' || val === 'yes' || val === '可' || val === '有') return true;
      if (typeof val === 'string' && val.trim().length > 0 && val.trim() !== '0' && val.trim() !== '-' && val.trim() !== '×' && val.trim() !== '不可' && val.trim() !== '無') return true;
      return false;
    };

    knownLines.forEach((l) => {
      const lineKey = keys.find((k) => {
        const cleanK = k.trim().toLowerCase();
        return cleanK === l.id.toLowerCase() || cleanK === l.name.toLowerCase() || cleanK === l.id.replace(' ', '').toLowerCase();
      });
      if (lineKey && isAffirmative(row[lineKey])) {
        lines.push(l.id);
      }
    });
  }

  let status: 'active' | 'suspended' | 'trial' = 'active';
  if (statusKey && row[statusKey]) {
    const rawStatus = String(row[statusKey]).toLowerCase();
    if (rawStatus.includes('trial') || rawStatus.includes('試作') || rawStatus.includes('評価')) {
      status = 'trial';
    } else if (rawStatus.includes('suspend') || rawStatus.includes('停止') || rawStatus.includes('休止')) {
      status = 'suspended';
    }
  }

  return {
    partNumber,
    vehicleModel,
    lines,
    notes: notesKey ? String(row[notesKey] || '').trim() : '',
    status,
  };
};

// Excel / CSV ファイルのパース
export const parseImportFile = async (file: File, knownLines: LineMaster[] = DEFAULT_LINES): Promise<ParseResult> => {
  const isCsv = file.name.endsWith('.csv');

  if (isCsv) {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const items: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[] = [];
          const errors: string[] = [];
          
          results.data.forEach((row, idx) => {
            const parsed = parseRawRow(row as Record<string, any>, knownLines);
            if (parsed) {
              items.push(parsed);
            } else {
              errors.push(`行 ${idx + 2}: 型番または車種名が不正です`);
            }
          });

          resolve({
            items,
            errors,
            totalRows: results.data.length,
          });
        },
        error: (error) => {
          resolve({
            items: [],
            errors: [`CSV解析エラー: ${error.message}`],
            totalRows: 0,
          });
        },
      });
    });
  }

  // Excel (.xlsx / .xls) の場合
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const items: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[] = [];
        const errors: string[] = [];

        jsonRows.forEach((row, idx) => {
          const parsed = parseRawRow(row, knownLines);
          if (parsed) {
            items.push(parsed);
          } else {
            errors.push(`行 ${idx + 2}: 型番または車種名が不正です`);
          }
        });

        resolve({
          items,
          errors,
          totalRows: jsonRows.length,
        });
      } catch (err: any) {
        resolve({
          items: [],
          errors: [`Excel解析エラー: ${err?.message || '不明なエラー'}`],
          totalRows: 0,
        });
      }
    };
    reader.onerror = () => {
      resolve({
        items: [],
        errors: ['ファイルの読み込みに失敗しました'],
        totalRows: 0,
      });
    };
    reader.readAsArrayBuffer(file);
  });
};

// Excel / CSV エクスポート
export const exportToExcelOrCsv = (
  items: PartModel[],
  knownLines: LineMaster[],
  format: 'xlsx' | 'csv'
) => {
  const exportRows = items.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: Record<string, any> = {
      '型番': item.partNumber,
      '車種': item.vehicleModel,
      '流動ライン一覧': item.lines.join(', '),
    };

    // 各ライン列の〇付け
    knownLines.forEach((line) => {
      row[line.name] = item.lines.includes(line.id) ? '〇' : '';
    });

    row['流動可能ライン数'] = item.lines.length;
    row['状態'] = item.status === 'trial' ? '試作' : item.status === 'suspended' ? '休止' : '稼働中';
    row['備考'] = item.notes || '';
    row['最終更新日時'] = item.updatedAt ? new Date(item.updatedAt).toLocaleString('ja-JP') : '';

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '型番・ライン一覧');

  const fileName = `型番流動ライン一覧_${new Date().toISOString().split('T')[0]}.${format}`;
  XLSX.writeFile(workbook, fileName, { bookType: format });
};

// テンプレートファイルのダウンロード
export const downloadTemplate = (knownLines: LineMaster[], format: 'xlsx' | 'csv') => {
  const sampleRows = [
    {
      '型番': 'ENG-1001-A',
      '車種': 'ヤリス',
      '流動ライン一覧': 'Line 1, Line 2, Line 5',
      ...Object.fromEntries(knownLines.map((l) => [l.name, ['Line 1', 'Line 2', 'Line 5'].includes(l.id) ? '〇' : ''])),
      '備考': '標準型番',
    },
    {
      '型番': 'ELE-9002-B',
      '車種': 'プリウス',
      '流動ライン一覧': 'Line 3, Line 12, Line 15',
      ...Object.fromEntries(knownLines.map((l) => [l.name, ['Line 3', 'Line 12', 'Line 15'].includes(l.id) ? '〇' : ''])),
      '備考': '複数ライン流動可能',
    },
    {
      '型番': 'CHA-4400-C',
      '車種': 'クラウン',
      '流動ライン一覧': 'Line 7, Line 17',
      ...Object.fromEntries(knownLines.map((l) => [l.name, ['Line 7', 'Line 17'].includes(l.id) ? '〇' : ''])),
      '備考': '大型ライン専用',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '登録テンプレート');

  const fileName = `型番登録テンプレート.${format}`;
  XLSX.writeFile(workbook, fileName, { bookType: format });
};
