import { useState, useEffect } from 'react';
import { supabase, Issue } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserIssues = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching user issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issueData: Partial<Issue>) => {
    if (!user?.email) throw new Error('User must be authenticated');

    const { data, error } = await supabase
      .from('issues')
      .insert([{
        ...issueData,
        user_email: user.email,
        status: 'submitted',
        upvotes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateIssueStatus = async (id: string, status: Issue['status'], assignedTo?: string) => {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (assignedTo) updateData.assigned_to = assignedTo;
    if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

    const { error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    
    // Refresh issues after update
    fetchIssues();
  };

  const upvoteIssue = async (id: string) => {
    const { error } = await supabase
      .from('issues')
      .update({ 
        upvotes: issues.find(i => i.id === id)?.upvotes + 1 || 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    
    // Refresh issues after upvote
    fetchIssues();
  };

  useEffect(() => {
    fetchIssues();

    // Set up real-time subscription
    const subscription = supabase
      .channel('issues_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'issues' }, 
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    issues,
    loading,
    createIssue,
    updateIssueStatus,
    upvoteIssue,
    fetchUserIssues,
    refetch: fetchIssues,
  };
}