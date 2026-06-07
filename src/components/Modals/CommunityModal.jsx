import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const mockPosts = [
  {
    id: 'mock-post-1',
    title: "Best organic pesticide for rice stem borer?",
    body: "I'm looking for effective organic or homemade pesticides to control stem borer infestation in my paddy field. Any suggestions?",
    profiles: { name: "Ramesh Senapati" },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    answers: [
      {
        id: 'mock-ans-1',
        text: "Try a neem oil solution. Mix 5ml of neem oil and 1ml of liquid soap in 1 liter of water and spray it.",
        profiles: { name: "Dilip Kumar" },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  }
];

export default function CommunityModal({ isOpen, onClose, user }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen, user]);

  const fetchPosts = async () => {
    if (!user) {
      const stored = localStorage.getItem('demo_posts');
      setPosts(stored ? JSON.parse(stored) : mockPosts);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // 2. Fetch Answers for all posts
      const updatedPosts = await Promise.all((postsData || []).map(async (post) => {
        const { data: answersData, error: answersError } = await supabase
          .from('forum_answers')
          .select('*, profiles(name)')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        if (answersError) throw answersError;
        return {
          ...post,
          answers: answersData || []
        };
      }));

      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error fetching community posts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (!user) {
      const newPost = {
        id: `mock-post-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        profiles: { name: "Anonymous Farmer" },
        created_at: new Date().toISOString(),
        answers: []
      };
      const updated = [newPost, ...posts];
      setPosts(updated);
      localStorage.setItem('demo_posts', JSON.stringify(updated));
      setTitle('');
      setBody('');
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          body: body.trim()
        }]);

      if (error) throw error;
      setTitle('');
      setBody('');
      fetchPosts();
    } catch (err) {
      alert("Error posting question: " + err.message);
    }
  };

  const handlePostReply = async (e, postId) => {
    e.preventDefault();
    const text = replyText[postId];
    if (!text || !text.trim()) return;

    if (!user) {
      const updated = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            answers: [
              ...post.answers,
              {
                id: `mock-ans-${Date.now()}`,
                text: text.trim(),
                profiles: { name: "Anonymous Responder" },
                created_at: new Date().toISOString()
              }
            ]
          };
        }
        return post;
      });
      setPosts(updated);
      localStorage.setItem('demo_posts', JSON.stringify(updated));
      setReplyText(prev => ({ ...prev, [postId]: '' }));
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_answers')
        .insert([{
          post_id: postId,
          user_id: user.id,
          text: text.trim()
        }]);

      if (error) throw error;
      setReplyText(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (err) {
      alert("Error posting reply: " + err.message);
    }
  };

  const handleReplyChange = (postId, val) => {
    setReplyText(prev => ({ ...prev, [postId]: val }));
  };

  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Community Forum</h2>
        
        <h3>Ask a New Question</h3>
        <form onSubmit={handlePostQuestion}>
          <div className="form-group">
            <label>Question Title</label>
            <input 
              type="text" 
              placeholder="e.g., Best fertilizer for tomatoes?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Details</label>
            <textarea 
              placeholder="Provide more details about your question..." 
              rows="4" 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="form-submit-btn">Post Question</button>
        </form>

        <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
        
        <h3>Recent Posts</h3>
        {loading ? (
          <p>Loading community posts...</p>
        ) : (
          <div id="forumPostsContainer">
            {posts.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No questions posted yet. Be the first to ask!</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="forum-post">
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    Posted by: {post.profiles?.name || 'Anonymous Farmer'} on {new Date(post.created_at).toLocaleString()}
                  </small>
                  
                  <div className="answer-section">
                    <h4>Answers:</h4>
                    {post.answers && post.answers.length > 0 ? (
                      post.answers.map((ans) => (
                        <div key={ans.id} className="answer">
                          <div>{ans.text}</div>
                          <small style={{ color: 'var(--text-secondary)' }}>
                            Answered by: {ans.profiles?.name || 'Anonymous Responder'} on {new Date(ans.created_at).toLocaleString()}
                          </small>
                        </div>
                      ))
                    ) : (
                      <p>No answers yet.</p>
                    )}
                    
                    <form className="answer-form" onSubmit={(e) => handlePostReply(e, post.id)}>
                      <textarea 
                        placeholder="Write your answer..." 
                        value={replyText[post.id] || ''}
                        onChange={(e) => handleReplyChange(post.id, e.target.value)}
                        required
                      ></textarea>
                      <button type="submit" className="form-submit-btn">Reply</button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
