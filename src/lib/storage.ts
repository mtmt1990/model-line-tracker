import { PartModel, LineMaster, DEFAULT_LINES, COLOR_PALETTES } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_SAMPLE_DATA } from './sample-data';

const ITEMS_STORAGE_KEY = 'model_line_tracker_items_v3';
const LINES_STORAGE_KEY = 'model_line_tracker_lines_v3';

// エラー詳細保持用
export let lastSupabaseError: string | null = null;

// === ラインマスター関連 ===

export const getLocalLines = (): LineMaster[] => {
  if (typeof window === 'undefined') return DEFAULT_LINES;
  try {
    const raw = localStorage.getItem(LINES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(DEFAULT_LINES));
      return DEFAULT_LINES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LINES;
  } catch (err) {
    console.error('Failed to load lines from localStorage:', err);
    return DEFAULT_LINES;
  }
};

export const saveLocalLines = (lines: LineMaster[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(lines));
  } catch (err) {
    console.error('Failed to save lines to localStorage:', err);
  }
};

export const fetchAllLines = async (): Promise<LineMaster[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lines_master')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        lastSupabaseError = error.message;
        throw error;
      }

      if (data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: LineMaster[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          color: d.color,
          bg: d.bg,
          lightBg: d.light_bg,
          order: d.order,
          active: d.active ?? true,
        }));
        saveLocalLines(mapped);
        return mapped;
      }
    } catch (err: any) {
      console.warn('Supabase fetch lines failed, falling back to local:', err?.message || err);
    }
  }
  return getLocalLines();
};

export const saveAllLines = async (lines: LineMaster[]): Promise<LineMaster[]> => {
  saveLocalLines(lines);

  if (isSupabaseConfigured && supabase) {
    try {
      const rows = lines.map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        bg: l.bg,
        light_bg: l.lightBg,
        order: l.order,
        active: l.active,
      }));
      const { error } = await supabase.from('lines_master').upsert(rows, { onConflict: 'id' });
      if (error) {
        lastSupabaseError = error.message;
        throw error;
      }
    } catch (err: any) {
      console.warn('Supabase save lines failed:', err?.message || err);
    }
  }

  return lines;
};

export const createNewLine = (name: string, customId?: string, linesList: LineMaster[] = []): LineMaster => {
  const trimmed = name.trim();
  const id = customId || (trimmed.startsWith('Line') ? trimmed : `Line ${trimmed.replace(/[^0-9a-zA-Z_-]/g, '') || Date.now()}`);
  const nextOrder = linesList.length > 0 ? Math.max(...linesList.map((l) => l.order || 0)) + 1 : 1;
  const palette = COLOR_PALETTES[(linesList.length) % COLOR_PALETTES.length];

  return {
    id,
    name: trimmed.includes('ライン') ? trimmed : `ライン ${trimmed}`,
    color: palette.color,
    bg: palette.bg,
    lightBg: palette.lightBg,
    order: nextOrder,
    active: true,
  };
};

// === 型番アイテム関連 ===

export const getLocalItems = (): PartModel[] => {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_DATA;
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_DATA));
      return INITIAL_SAMPLE_DATA;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load items from localStorage:', err);
    return INITIAL_SAMPLE_DATA;
  }
};

export const saveLocalItems = (items: PartModel[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage:', err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDbToModel = (row: any): PartModel => ({
  id: row.id,
  partNumber: row.part_number,
  vehicleModel: row.vehicle_model,
  lines: Array.isArray(row.lines) ? row.lines : [],
  notes: row.notes || '',
  status: row.status || 'active',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapModelToDb = (model: Partial<PartModel>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbData: any = {};
  if (model.id) dbData.id = model.id;
  if (model.partNumber !== undefined) dbData.part_number = model.partNumber.trim();
  if (model.vehicleModel !== undefined) dbData.vehicle_model = model.vehicleModel.trim();
  if (model.lines !== undefined) dbData.lines = model.lines;
  if (model.notes !== undefined) dbData.notes = model.notes.trim();
  if (model.status !== undefined) dbData.status = model.status;
  return dbData;
};

export const fetchAllPartModels = async (): Promise<{ items: PartModel[]; source: 'supabase' | 'local'; error?: string }> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('part_models')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        lastSupabaseError = error.message;
        throw error;
      }

      lastSupabaseError = null;
      if (data && data.length > 0) {
        const mapped = data.map(mapDbToModel);
        saveLocalItems(mapped);
        return {
          items: mapped,
          source: 'supabase',
        };
      } else if (data && data.length === 0) {
        return { items: [], source: 'supabase' };
      }
    } catch (err: any) {
      console.warn('Supabase fetch failed, falling back to localStorage:', err?.message || err);
      return {
        items: getLocalItems(),
        source: 'local',
        error: err?.message || 'Supabase接続エラー',
      };
    }
  }

  return {
    items: getLocalItems(),
    source: 'local',
  };
};

export const createPartModel = async (
  item: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PartModel> => {
  const now = new Date().toISOString();
  const newItem: PartModel = {
    ...item,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'item-' + Date.now(),
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const dbRow = mapModelToDb(newItem);
      const { data, error } = await supabase
        .from('part_models')
        .insert([dbRow])
        .select()
        .single();

      if (error) throw error;
      return mapDbToModel(data);
    } catch (err: any) {
      console.warn('Supabase insert failed, saving to local only:', err?.message || err);
    }
  }

  const items = getLocalItems();
  const updated = [newItem, ...items];
  saveLocalItems(updated);
  return newItem;
};

export const updatePartModel = async (item: PartModel): Promise<PartModel> => {
  const updatedItem: PartModel = {
    ...item,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const dbRow = mapModelToDb(updatedItem);
      const { data, error } = await supabase
        .from('part_models')
        .update(dbRow)
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToModel(data);
    } catch (err: any) {
      console.warn('Supabase update failed, saving to local only:', err?.message || err);
    }
  }

  const items = getLocalItems();
  const updated = items.map((i) => (i.id === item.id ? updatedItem : i));
  saveLocalItems(updated);
  return updatedItem;
};

export const deletePartModel = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('part_models').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.warn('Supabase delete failed:', err?.message || err);
    }
  }

  const items = getLocalItems();
  const updated = items.filter((i) => i.id !== id);
  saveLocalItems(updated);
};

export const bulkImportPartModels = async (
  newItems: Omit<PartModel, 'id' | 'createdAt' | 'updatedAt'>[],
  mode: 'replace' | 'merge'
): Promise<PartModel[]> => {
  const now = new Date().toISOString();
  const current = mode === 'merge' ? getLocalItems() : [];

  const itemMap = new Map<string, PartModel>();
  
  if (mode === 'merge') {
    current.forEach((it) => itemMap.set(it.partNumber.toLowerCase(), it));
  }

  newItems.forEach((it) => {
    const key = it.partNumber.toLowerCase();
    const existing = itemMap.get(key);
    if (existing) {
      itemMap.set(key, {
        ...existing,
        ...it,
        updatedAt: now,
      });
    } else {
      itemMap.set(key, {
        ...it,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'item-' + Math.random().toString(36).substring(2, 9),
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  const finalItems = Array.from(itemMap.values());

  if (isSupabaseConfigured && supabase) {
    try {
      if (mode === 'replace') {
        await supabase.from('part_models').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      const rows = finalItems.map(mapModelToDb);
      const { data, error } = await supabase
        .from('part_models')
        .upsert(rows, { onConflict: 'part_number' })
        .select();

      if (error) throw error;
      if (data) {
        const mapped = data.map(mapDbToModel);
        saveLocalItems(mapped);
        return mapped;
      }
    } catch (err: any) {
      console.warn('Supabase bulk upsert failed, saving to local:', err?.message || err);
    }
  }

  saveLocalItems(finalItems);
  return finalItems;
};

export const resetToSampleData = async (): Promise<PartModel[]> => {
  saveLocalItems(INITIAL_SAMPLE_DATA);
  saveLocalLines(DEFAULT_LINES);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('part_models').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const rows = INITIAL_SAMPLE_DATA.map(mapModelToDb);
      await supabase.from('part_models').insert(rows);
    } catch (err: any) {
      console.warn('Supabase reset failed:', err?.message || err);
    }
  }
  return INITIAL_SAMPLE_DATA;
};
