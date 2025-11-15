import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Plus, X, User } from 'lucide-react-native';

interface Player {
  id: string;
  type: 'user' | 'guest';
  userId?: string;
  username?: string;
  guestName?: string;
}

export default function CreateSessionScreen() {
  const { gameId } = useLocalSearchParams();
  const [gameName, setGameName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [guestName, setGuestName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchGame();
    if (user) {
      addCurrentUser();
    }
  }, [gameId, user]);

  const fetchGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('title')
        .eq('id', gameId)
        .maybeSingle();

      if (error) throw error;
      setGameName(data?.title || '');
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const addCurrentUser = () => {
    setPlayers([
      {
        id: user!.id,
        type: 'user',
        userId: user!.id,
        username: user!.email?.split('@')[0] || 'You',
      },
    ]);
  };

  const addGuest = () => {
    if (!guestName.trim()) {
      Alert.alert('Error', 'Please enter a guest name');
      return;
    }

    const newPlayer: Player = {
      id: `guest_${Date.now()}`,
      type: 'guest',
      guestName: guestName.trim(),
    };

    setPlayers([...players, newPlayer]);
    setGuestName('');
  };

  const removePlayer = (playerId: string) => {
    if (playerId === user?.id) {
      Alert.alert('Error', 'You cannot remove yourself from the session');
      return;
    }
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  const createSession = async () => {
    if (players.length < 1) {
      Alert.alert('Error', 'At least one player is required');
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          game_id: gameId,
          host_id: user?.id,
          notes: notes.trim(),
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const playerInserts = players.map((player) => ({
        session_id: sessionData.id,
        user_id: player.type === 'user' ? player.userId : null,
        guest_name: player.type === 'guest' ? player.guestName : null,
        final_score: 0,
      }));

      const { error: playersError } = await supabase
        .from('session_players')
        .insert(playerInserts);

      if (playersError) throw playersError;

      Alert.alert('Success', 'Session created!');
      router.replace(`/session/${sessionData.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Session</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.gameSection}>
          <Text style={styles.gameTitle}>{gameName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players ({players.length})</Text>

          {players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerIcon}>
                <User size={20} color="#007AFF" />
              </View>
              <Text style={styles.playerName}>
                {player.type === 'user' ? player.username : player.guestName}
              </Text>
              {player.id !== user?.id && (
                <TouchableOpacity onPress={() => removePlayer(player.id)}>
                  <X size={20} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.addPlayerSection}>
            <TextInput
              style={styles.input}
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Guest player name"
            />
            <TouchableOpacity style={styles.addButton} onPress={addGuest}>
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this session..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={createSession}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Start Session'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  gameSection: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  playerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addPlayerSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
