import { supabase } from '@/lib/supabase';

export interface ImportedGame {
  title: string;
  description?: string;
  minPlayers?: number;
  maxPlayers?: number;
  durationMinutes?: number;
  ageMin?: number;
  complexity?: number;
  rules?: {
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
  scoringSystem?: {
    name: string;
    config: any;
    isAutomated?: boolean;
  };
}

export interface ImportResult {
  success: boolean;
  gameId?: string;
  error?: string;
}

export const importGame = async (
  gameData: ImportedGame,
  userId: string,
  isPublic: boolean = false
): Promise<ImportResult> => {
  try {
    const { data: gameRecord, error: gameError } = await supabase
      .from('games')
      .insert({
        title: gameData.title,
        description: gameData.description || '',
        min_players: gameData.minPlayers || 2,
        max_players: gameData.maxPlayers || 4,
        duration_minutes: gameData.durationMinutes || 60,
        age_min: gameData.ageMin || 8,
        complexity: gameData.complexity || 3,
        creator_id: userId,
        is_public: isPublic,
      })
      .select()
      .single();

    if (gameError) throw gameError;

    if (gameData.rules) {
      const { error: rulesError } = await supabase.from('game_rules').insert({
        game_id: gameRecord.id,
        content: gameData.rules,
        version: '1.0',
        language: 'en',
      });

      if (rulesError) throw rulesError;
    }

    if (gameData.scoringSystem) {
      const { error: scoringError } = await supabase
        .from('scoring_systems')
        .insert({
          game_id: gameRecord.id,
          name: gameData.scoringSystem.name,
          config: gameData.scoringSystem.config,
          is_automated: gameData.scoringSystem.isAutomated || false,
        });

      if (scoringError) throw scoringError;
    }

    const { error: libraryError } = await supabase
      .from('user_libraries')
      .insert({
        user_id: userId,
        game_id: gameRecord.id,
        ownership_status: 'owned',
      });

    if (libraryError) throw libraryError;

    return { success: true, gameId: gameRecord.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const importFromJSON = async (
  jsonString: string,
  userId: string,
  isPublic: boolean = false
): Promise<ImportResult> => {
  try {
    const gameData = JSON.parse(jsonString) as ImportedGame;
    return await importGame(gameData, userId, isPublic);
  } catch (error: any) {
    return { success: false, error: 'Invalid JSON format' };
  }
};

export const exportGame = async (gameId: string): Promise<string | null> => {
  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();

    if (gameError) throw gameError;
    if (!game) return null;

    const { data: rules } = await supabase
      .from('game_rules')
      .select('content')
      .eq('game_id', gameId)
      .maybeSingle();

    const { data: scoringSystem } = await supabase
      .from('scoring_systems')
      .select('name, config, is_automated')
      .eq('game_id', gameId)
      .maybeSingle();

    const exportData: ImportedGame = {
      title: game.title,
      description: game.description,
      minPlayers: game.min_players,
      maxPlayers: game.max_players,
      durationMinutes: game.duration_minutes,
      ageMin: game.age_min,
      complexity: game.complexity,
      rules: rules?.content,
      scoringSystem: scoringSystem
        ? {
            name: scoringSystem.name,
            config: scoringSystem.config,
            isAutomated: scoringSystem.is_automated,
          }
        : undefined,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting game:', error);
    return null;
  }
};

export const parseCSV = (csvString: string): ImportedGame[] => {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const games: ImportedGame[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const game: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      switch (header.toLowerCase()) {
        case 'title':
          game.title = value;
          break;
        case 'description':
          game.description = value;
          break;
        case 'minplayers':
        case 'min_players':
          game.minPlayers = parseInt(value) || 2;
          break;
        case 'maxplayers':
        case 'max_players':
          game.maxPlayers = parseInt(value) || 4;
          break;
        case 'duration':
        case 'duration_minutes':
          game.durationMinutes = parseInt(value) || 60;
          break;
        case 'age':
        case 'age_min':
          game.ageMin = parseInt(value) || 8;
          break;
        case 'complexity':
          game.complexity = parseInt(value) || 3;
          break;
      }
    });

    if (game.title) {
      games.push(game);
    }
  }

  return games;
};
