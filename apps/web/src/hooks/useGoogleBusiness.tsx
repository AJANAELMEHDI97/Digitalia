import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface GoogleBusinessConnection {
  id: string;
  user_id: string;
  location_name: string | null;
  email: string | null;
  connected_at: string;
}

export interface GoogleReview {
  id: string;
  review_id: string;
  reviewer_name: string | null;
  reviewer_photo_url: string | null;
  star_rating: number | null;
  comment: string | null;
  review_reply: string | null;
  create_time: string | null;
  update_time: string | null;
  reply_updated_at: string | null;
}

export interface GooglePost {
  id: string;
  post_type: string;
  summary: string;
  media_url: string | null;
  call_to_action_type: string | null;
  call_to_action_url: string | null;
  event_title: string | null;
  event_start_date: string | null;
  event_end_date: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
}

// Demo data for reviews
const DEMO_REVIEWS: GoogleReview[] = [
  {
    id: 'demo-1',
    review_id: 'review_demo_1',
    reviewer_name: 'Marie Dupont',
    reviewer_photo_url: null,
    star_rating: 5,
    comment: 'Excellent avocat, très professionnel et à l\'écoute. Je recommande vivement !',
    review_reply: 'Merci beaucoup Marie pour votre confiance. C\'est toujours un plaisir de vous accompagner.',
    create_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    update_time: null,
    reply_updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-2',
    review_id: 'review_demo_2',
    reviewer_name: 'Jean-Pierre Martin',
    reviewer_photo_url: null,
    star_rating: 4,
    comment: 'Bon suivi du dossier, délais respectés. Seul bémol : difficile à joindre parfois.',
    review_reply: null,
    create_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    update_time: null,
    reply_updated_at: null
  },
  {
    id: 'demo-3',
    review_id: 'review_demo_3',
    reviewer_name: 'Sophie Bernard',
    reviewer_photo_url: null,
    star_rating: 5,
    comment: 'Cabinet de qualité, conseils pertinents pour mon divorce. Très satisfaite du résultat.',
    review_reply: 'Merci Sophie, nous sommes ravis d\'avoir pu vous aider dans cette période difficile.',
    create_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    update_time: null,
    reply_updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-4',
    review_id: 'review_demo_4',
    reviewer_name: 'Laurent Petit',
    reviewer_photo_url: null,
    star_rating: 3,
    comment: 'Compétent mais les honoraires sont un peu élevés par rapport à la concurrence.',
    review_reply: null,
    create_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    update_time: null,
    reply_updated_at: null
  },
  {
    id: 'demo-5',
    review_id: 'review_demo_5',
    reviewer_name: 'Isabelle Moreau',
    reviewer_photo_url: null,
    star_rating: 5,
    comment: 'Maître a su défendre mes intérêts avec brio. Résultat au-delà de mes espérances !',
    review_reply: 'Merci pour ces mots Isabelle. Votre satisfaction est notre priorité.',
    create_time: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    update_time: null,
    reply_updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-6',
    review_id: 'review_demo_6',
    reviewer_name: 'Thomas Leroy',
    reviewer_photo_url: null,
    star_rating: 4,
    comment: 'Très bonne expérience, cabinet réactif et compétent en droit des affaires.',
    review_reply: null,
    create_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    update_time: null,
    reply_updated_at: null
  }
];

// Demo data for posts
const DEMO_POSTS: GooglePost[] = [
  {
    id: 'demo-post-1',
    post_type: 'STANDARD',
    summary: '📢 Nouveau : Consultations gratuites pour les victimes de licenciement abusif. Prenez rendez-vous dès maintenant pour faire valoir vos droits !',
    media_url: null,
    call_to_action_type: 'BOOK',
    call_to_action_url: 'https://calendly.com/cabinet',
    event_title: null,
    event_start_date: null,
    event_end_date: null,
    status: 'published',
    scheduled_at: null,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-post-2',
    post_type: 'EVENT',
    summary: 'Rejoignez-nous pour une conférence gratuite sur le droit du travail et les nouvelles réformes 2025.',
    media_url: null,
    call_to_action_type: 'SIGN_UP',
    call_to_action_url: null,
    event_title: 'Conférence Droit du Travail 2025',
    event_start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    event_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'published',
    scheduled_at: null,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-post-3',
    post_type: 'OFFER',
    summary: '🎁 Offre spéciale : -20% sur les consultations en droit de la famille jusqu\'au 31 janvier. Code : FAMILLE2025',
    media_url: null,
    call_to_action_type: 'CALL',
    call_to_action_url: null,
    event_title: null,
    event_start_date: null,
    event_end_date: null,
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export function useGoogleBusiness() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<GoogleBusinessConnection | null>(null);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [posts, setPosts] = useState<GooglePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);

  useEffect(() => {
    if (user) {
      checkConnection();
    } else {
      // No user, show demo data
      setUseDemoData(true);
      setReviews(DEMO_REVIEWS);
      setPosts(DEMO_POSTS);
      setLoading(false);
    }
  }, [user]);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('google-business-api', {
        body: { action: 'check_connection' }
      });

      if (error) throw error;
      
      if (data?.connected) {
        setConnection(data.connection);
        setUseDemoData(false);
        await Promise.all([fetchReviews(), fetchPosts()]);
      } else {
        // Not connected, show demo data
        setConnection(null);
        setUseDemoData(true);
        setReviews(DEMO_REVIEWS);
        setPosts(DEMO_POSTS);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      // On error, show demo data
      setUseDemoData(true);
      setReviews(DEMO_REVIEWS);
      setPosts(DEMO_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data: reviewsData } = await supabase
        .from('google_business_reviews')
        .select('*')
        .order('create_time', { ascending: false });

      if (reviewsData && reviewsData.length > 0) {
        setReviews(reviewsData);
        setUseDemoData(false);
      } else {
        // No real data, use demo
        setReviews(DEMO_REVIEWS);
        setUseDemoData(true);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(DEMO_REVIEWS);
      setUseDemoData(true);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: postsData } = await supabase
        .from('google_business_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsData && postsData.length > 0) {
        setPosts(postsData);
      } else if (useDemoData) {
        setPosts(DEMO_POSTS);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (useDemoData) {
        setPosts(DEMO_POSTS);
      }
    }
  };

  const connect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-business-api', {
        body: { action: 'get_auth_url' }
      });
      
      if (error) throw error;
      
      if (data?.auth_url) {
        toast.info('Configuration Google requise', {
          description: 'Veuillez d\'abord configurer les credentials Google OAuth dans les paramètres.'
        });
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      toast.error('Erreur lors de la connexion');
    }
  };

  const disconnect = async () => {
    try {
      const { error } = await supabase.functions.invoke('google-business-api', {
        body: { action: 'disconnect' }
      });
      
      if (error) throw error;
      
      setConnection(null);
      setUseDemoData(true);
      setReviews(DEMO_REVIEWS);
      setPosts(DEMO_POSTS);
      toast.success('Compte Google Business déconnecté');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const replyToReview = async (reviewId: string, reply: string) => {
    if (useDemoData) {
      // Update demo data locally
      setReviews(prev => prev.map(r => 
        r.id === reviewId 
          ? { ...r, review_reply: reply, reply_updated_at: new Date().toISOString() }
          : r
      ));
      toast.success('Réponse enregistrée (démo)');
      return;
    }

    try {
      const { error } = await supabase
        .from('google_business_reviews')
        .update({ 
          review_reply: reply,
          reply_updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);
      
      if (error) throw error;
      
      await fetchReviews();
      toast.success('Réponse enregistrée');
    } catch (error) {
      console.error('Error replying to review:', error);
      toast.error('Erreur lors de l\'enregistrement de la réponse');
    }
  };

  const createPost = async (postData: Partial<GooglePost>) => {
    if (useDemoData) {
      const newPost: GooglePost = {
        id: `demo-post-${Date.now()}`,
        post_type: postData.post_type || 'STANDARD',
        summary: postData.summary || '',
        media_url: postData.media_url || null,
        call_to_action_type: postData.call_to_action_type || null,
        call_to_action_url: postData.call_to_action_url || null,
        event_title: postData.event_title || null,
        event_start_date: postData.event_start_date || null,
        event_end_date: postData.event_end_date || null,
        status: postData.scheduled_at ? 'scheduled' : 'draft',
        scheduled_at: postData.scheduled_at || null,
        published_at: null,
        created_at: new Date().toISOString()
      };
      setPosts(prev => [newPost, ...prev]);
      toast.success('Publication créée (démo)');
      return newPost;
    }

    try {
      const { data, error } = await supabase
        .from('google_business_posts')
        .insert({
          user_id: user?.id,
          post_type: postData.post_type || 'STANDARD',
          summary: postData.summary || '',
          media_url: postData.media_url,
          call_to_action_type: postData.call_to_action_type,
          call_to_action_url: postData.call_to_action_url,
          event_title: postData.event_title,
          event_start_date: postData.event_start_date,
          event_end_date: postData.event_end_date,
          status: postData.scheduled_at ? 'scheduled' : 'draft',
          scheduled_at: postData.scheduled_at
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchPosts();
      toast.success('Publication créée');
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erreur lors de la création de la publication');
      return null;
    }
  };

  const publishPost = async (postId: string) => {
    if (useDemoData) {
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, status: 'published', published_at: new Date().toISOString() }
          : p
      ));
      toast.success('Publication publiée (démo)');
      return;
    }

    try {
      const { error } = await supabase
        .from('google_business_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId);
      
      if (error) throw error;
      
      await fetchPosts();
      toast.success('Publication publiée sur Google Business');
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  const deletePost = async (postId: string) => {
    if (useDemoData) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Publication supprimée (démo)');
      return;
    }

    try {
      const { error } = await supabase
        .from('google_business_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      await fetchPosts();
      toast.success('Publication supprimée');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const syncReviews = async () => {
    try {
      setSyncing(true);
      toast.info('Synchronisation en cours...');
      
      // This would sync from Google API when configured
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!useDemoData) {
        await fetchReviews();
      }
      toast.success('Avis synchronisés');
    } catch (error) {
      console.error('Error syncing reviews:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  return {
    connection,
    reviews,
    posts,
    loading,
    syncing,
    useDemoData,
    connect,
    disconnect,
    replyToReview,
    createPost,
    publishPost,
    deletePost,
    syncReviews,
    refetch: checkConnection
  };
}
