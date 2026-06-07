import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const mockPosts = [
  {
    id: 'mock-post-1',
    title: "Best organic pesticide for rice stem borer?",
    body: "I'm looking for effective organic or homemade pesticides to control stem borer infestation in my paddy field. Any suggestions?",
    author_name: "Ramesh Senapati",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    answers: [
      {
        id: 'mock-ans-1',
        text: "Try a neem oil solution. Mix 5ml of neem oil and 1ml of liquid soap in 1 liter of water and spray it.",
        author_name: "Dilip Kumar",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  }
];

export default function CommunityModal({ isOpen, onClose, isAdmin }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyAuthorName, setReplyAuthorName] = useState({});
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const updatedPosts = await Promise.all((postsData || []).map(async (post) => {
        const { data: answersData, error: answersError } = await supabase
          .from('forum_answers')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });

        if (answersError) throw answersError;
        return {
          ...post,
          answers: answersData || []
        };
      }));

      setPosts(updatedPosts.length > 0 ? updatedPosts : mockPosts);
    } catch (err) {
      console.warn("Error fetching community posts, using fallback:", err.message);
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const name = authorName.trim() || 'Anonymous Farmer';

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert([{
          author_name: name,
          title: title.trim(),
          body: body.trim()
        }]);

      if (error) throw error;
      setTitle('');
      setBody('');
      setAuthorName('');
      fetchPosts();
    } catch (err) {
      console.error("Could not post to database, adding locally:", err.message);
      const newPost = {
        id: `local-post-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        author_name: name,
        created_at: new Date().toISOString(),
        answers: []
      };
      setPosts(prev => [newPost, ...prev]);
      setTitle('');
      setBody('');
      setAuthorName('');
    }
  };

  const handlePostReply = async (e, postId) => {
    e.preventDefault();
    const text = replyText[postId];
    const replier = replyAuthorName[postId] || 'Anonymous Responder';
    if (!text || !text.trim()) return;

    try {
      const { error } = await supabase
        .from('forum_answers')
        .insert([{
          post_id: postId,
          author_name: replier.trim(),
          text: text.trim()
        }]);

      if (error) throw error;
      setReplyText(prev => ({ ...prev, [postId]: '' }));
      setReplyAuthorName(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (err) {
      console.error("Could not post reply to database, adding locally:", err.message);
      const updated = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            answers: [
              ...post.answers,
              {
                id: `local-ans-${Date.now()}`,
                text: text.trim(),
                author_name: replier.trim(),
                created_at: new Date().toISOString()
              }
            ]
          };
        }
        return post;
      });
      setPosts(updated);
      setReplyText(prev => ({ ...prev, [postId]: '' }));
      setReplyAuthorName(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
      fetchPosts();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleReplyChange = (postId, val) => {
    setReplyText(prev => ({ ...prev, [postId]: val }));
  };

  const handleReplierNameChange = (postId, val) => {
    setReplyAuthorName(prev => ({ ...prev, [postId]: val }));
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
            <label>Your Name</label>
            <input 
              type="text" 
              placeholder="e.g., Farmer Bipin (Leave blank for Anonymous)" 
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>
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
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No questions posted yet.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="forum-post" style={{ position: 'relative' }}>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        backgroundColor: 'var(--expense-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    Posted by: {post.author_name} on {new Date(post.created_at).toLocaleString()}
                  </small>
                  
                  <div className="answer-section">
                    <h4>Answers:</h4>
                    {post.answers && post.answers.length > 0 ? (
                      post.answers.map((ans) => (
                        <div key={ans.id} className="answer">
                          <div>{ans.text}</div>
                          <small style={{ color: 'var(--text-secondary)' }}>
                            Answered by: {ans.author_name} on {new Date(ans.created_at).toLocaleString()}
                          </small>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No answers yet.</p>
                    )}
                    
                    <form className="answer-form" onSubmit={(e) => handlePostReply(e, post.id)}>
                      <input 
                        type="text" 
                        placeholder="Your name" 
                        style={{ width: '120px', padding: '6px', fontSize: '0.85rem' }}
                        value={replyAuthorName[post.id] || ''}
                        onChange={(e) => handleReplierNameChange(post.id, e.target.value)}
                      />
                      <textarea 
                        placeholder="Write your answer..." 
                        value={replyText[post.id] || ''}
                        onChange={(e) => handleReplyChange(post.id, e.target.value)}
                        required
                      ></textarea>
                      <button type="submit" className="form-submit-btn" style={{ padding: '0 10px', height: '40px' }}>Reply</button>
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
