import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Issue = Tables<'issues'>;
export type IssueInsert = TablesInsert<'issues'>;

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
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching user issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issueData: Omit<IssueInsert, 'user_id'>) => {
    if (!user?.id) throw new Error('User must be authenticated');

    const { data, error } = await supabase
      .from('issues')
      .insert([{
        ...issueData,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    // Create a notification for the user
    await supabase.from('notifications').insert([{
      user_id: user.id,
      issue_id: data.id,
      title_en: 'Issue Submitted',
      title_hi: 'समस्या दर्ज की गई',
      message_en: `Your issue "${data.title}" has been submitted successfully.`,
      message_hi: `आपकी समस्या "${data.title}" सफलतापूर्वक दर्ज कर ली गई है।`,
    }]);

    return data;
  };

  const updateIssueStatus = async (id: string, status: Issue['status']) => {
    const updateData: Partial<Issue> = { status };
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: issue, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for status update
    if (issue) {
      const statusMessages = {
        acknowledged: {
          en: 'Your issue has been acknowledged by the authorities.',
          hi: 'आपकी समस्या को अधिकारियों ने स्वीकार कर लिया है।',
        },
        in_progress: {
          en: 'Work has started on your issue.',
          hi: 'आपकी समस्या पर काम शुरू हो गया है।',
        },
        resolved: {
          en: 'Your issue has been resolved!',
          hi: 'आपकी समस्या का समाधान हो गया है!',
        },
      };

      const message = statusMessages[status as keyof typeof statusMessages];
      if (message) {
        await supabase.from('notifications').insert([{
          user_id: issue.user_id,
          issue_id: id,
          title_en: `Status Update: ${status.replace('_', ' ').toUpperCase()}`,
          title_hi: `स्थिति अपडेट: ${status === 'acknowledged' ? 'स्वीकृत' : status === 'in_progress' ? 'प्रगति पर' : 'समाधान'}`,
          message_en: message.en,
          message_hi: message.hi,
        }]);
      }
    }
    
    fetchIssues();
  };

  const upvoteIssue = async (id: string) => {
    if (!user?.id) throw new Error('User must be authenticated');

    // Check if user already upvoted
    const { data: existingUpvote } = await supabase
      .from('issue_upvotes')
      .select('id')
      .eq('issue_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingUpvote) {
      // Remove upvote
      await supabase
        .from('issue_upvotes')
        .delete()
        .eq('id', existingUpvote.id);

      await supabase
        .from('issues')
        .update({ upvotes: (issues.find(i => i.id === id)?.upvotes || 1) - 1 })
        .eq('id', id);
    } else {
      // Add upvote
      await supabase
        .from('issue_upvotes')
        .insert([{ issue_id: id, user_id: user.id }]);

      await supabase
        .from('issues')
        .update({ upvotes: (issues.find(i => i.id === id)?.upvotes || 0) + 1 })
        .eq('id', id);
    }
    
    fetchIssues();
  };

  const submitFeedback = async (issueId: string, rating: number, comment?: string) => {
    if (!user?.id) throw new Error('User must be authenticated');

    const { error } = await supabase
      .from('feedback')
      .insert([{
        issue_id: issueId,
        user_id: user.id,
        rating,
        comment,
      }]);

    if (error) throw error;
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('issue-photos')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('issue-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  useEffect(() => {
    fetchIssues();

    // Set up real-time subscription
    const channel = supabase
      .channel('issues_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'issues' }, 
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    issues,
    loading,
    createIssue,
    updateIssueStatus,
    upvoteIssue,
    submitFeedback,
    uploadPhoto,
    fetchUserIssues,
    refetch: fetchIssues,
  };
}
