import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Trophy, Save } from 'lucide-react-native';

interface SessionPlayer {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  final_score: number;
  position: number | null;
  profiles?: {
    username: string;
  };
}

interface Session {
  id: string;
  game_id: string;
  host_id: string;
  started_at: string;
  ended_at: string | null;
  notes: string;
  games: {
    title: string;
  };
}

export default function SessionScreen() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState<Session | null>(null);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select(
          `
          *,
          games (title)
        `
        )
        .eq('id', id)
        .maybeSingle();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      const { data: playersData, error: playersError } = await supabase
        .from('session_players')
        .select(
          `
          *,
          profiles (username)
        `
        )
        .eq('session_id', id)
        .order('position', { ascending: true, nullsFirst: false });

      if (playersError) throw playersError;
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error fetching session:', error);
      Alert.alert('Error', 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const updateScore = (playerId: string, score: string) => {
    const numScore = parseFloat(score) || 0;
    setPlayers(
      players.map((p) =>
        p.id === playerId ? { ...p, final_score: numScore } : p
      )
    );
  };

  const calculatePositions = () => {
    const sortedPlayers = [...players].sort(
      (a, b) => b.final_score - a.final_score
    );
    return sortedPlayers.map((player, index) => ({
      ...player,
      position: index + 1,
    }));
  };

  const saveScores = async () => {
    setSaving(true);
    try {
      const playersWithPositions = calculatePositions();

      const updates = playersWithPositions.map((player) =>
        supabase
          .from('session_players')
          .update({
            final_score: player.final_score,
            position: player.position,
          })
          .eq('id', player.id)
      );

      await Promise.all(updates);

      if (!session?.ended_at) {
        await supabase
          .from('game_sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('id', id);
      }

      Alert.alert('Success', 'Scores saved!');
      fetchSession();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save scores');
    } finally {
      setSaving(false);
    }
  };

  const endSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session? Make sure to save scores first!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('game_sessions')
                .update({ ended_at: new Date().toISOString() })
                .eq('id', id);

              Alert.alert('Session Ended', 'Session has been completed');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to end session');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isHost = user?.id === session?.host_id;
  const isActive = !session?.ended_at;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isActive ? 'Active Session' : 'Session Results'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.gameSection}>
          <Trophy size={48} color="#007AFF" />
          <Text style={styles.gameTitle}>{session?.games.title}</Text>
          <Text style={styles.sessionDate}>
            {new Date(session?.started_at || '').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>

          {players.map((player, index) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerInfo}>
                {player.position && (
                  <View
                    style={[
                      styles.positionBadge,
                      player.position === 1 && styles.positionBadgeGold,
                    ]}
                  >
                    <Text
                      style={[
                        styles.positionText,
                        player.position === 1 && styles.positionTextGold,
                      ]}
                    >
                      #{player.position}
                    </Text>
                  </View>
                )}
                <Text style={styles.playerName}>
                  {player.profiles?.username || player.guest_name}
                </Text>
              </View>

              {isActive && isHost ? (
                <TextInput
                  style={styles.scoreInput}
                  value={player.final_score.toString()}
                  onChangeText={(score) => updateScore(player.id, score)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              ) : (
                <Text style={styles.scoreText}>{player.final_score}</Text>
              )}
            </View>
          ))}
        </View>

        {session?.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{session.notes}</Text>
            </View>
          </View>
        )}

        {isHost && isActive && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveScores}
              disabled={saving}
            >
              <Save size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Scores'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endButton} onPress={endSession}>
              <Text style={styles.endButtonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    textAlign: 'center',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    justifyContent: 'space-between',
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
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionBadgeGold: {
    backgroundColor: '#FFD700',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  positionTextGold: {
    color: '#1a1a1a',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  scoreInput: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    width: 100,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  notesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
