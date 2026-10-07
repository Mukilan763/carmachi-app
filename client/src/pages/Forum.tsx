import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Search, Plus, X, Send, Filter, Clock, TrendingUp, User } from 'lucide-react';
import { forumAPI } from '../utils/api';
import { getUser } from '../utils/authStore';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  category: string;
  carId?: string;
  createdAt: string;
  likes: number;
  replies: any[];
  tags?: string[];
}

const CATEGORIES = [
  { id: 'all', label: 'All Posts', icon: '💬' },
  { id: 'review', label: 'Reviews', icon: '⭐' },
  { id: 'issue', label: 'Issues & Problems', icon: '🔧' },
  { id: 'advice', label: 'Buying Advice', icon: '🤔' },
  { id: 'comparison', label: 'Comparisons', icon: '⚖️' },
  { id: 'experience', label: 'Ownership', icon: '🚗' },
];

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('review');

  const user = getUser();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sortBy };
      if (category !== 'all') params.category = category;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await forumAPI.getPosts(params);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [category, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await forumAPI.createPost({
        title: newTitle,
        content: newContent,
        category: newCategory,
        authorName: user.isLoggedIn ? user.name : 'Anonymous Driver',
        tags: ['discussion'],
      });
      setNewTitle('');
      setNewContent('');
      setShowNewPost(false);
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return;
    try {
      await forumAPI.replyToPost(postId, {
        content: replyText,
        authorName: user.isLoggedIn ? user.name : 'Anonymous Driver',
      });
      setReplyText('');
      fetchPosts();
    } catch (err) {
      console.error('Error replying:', err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await forumAPI.likePost(postId);
      fetchPosts();
    } catch (err) {
      console.error('Error liking:', err);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Community Forum</h1>
          <p className="text-gray-500 mt-1">Discuss, review, and share your car ownership experience with fellow Indians.</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, cars, topics..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </form>

      {/* Category Tabs + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                category === cat.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border-gray-200 rounded-lg py-1.5 px-2 bg-white border font-medium focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewPost(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
              <button onClick={() => setShowNewPost(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Post title..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your thoughts, questions, or experience..."
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-blue-500"
              >
                <option value="review">⭐ Review</option>
                <option value="issue">🔧 Issue / Problem</option>
                <option value="advice">🤔 Buying Advice</option>
                <option value="comparison">⚖️ Comparison</option>
                <option value="experience">🚗 Ownership Experience</option>
              </select>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowNewPost(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Publish Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading forum posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No posts found</h3>
          <p className="text-gray-500">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Post Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="bg-blue-50 text-blue-700 text-[11px] font-bold uppercase px-2 py-0.5 rounded-md">
                        {CATEGORIES.find(c => c.id === post.category)?.icon || '💬'} {post.category}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo(post.createdAt)}</span>
                      </span>
                    </div>
                    <h3
                      className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    >
                      {post.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-3">{post.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium">{post.authorName}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-xs font-semibold">{post.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs font-semibold">{post.replies?.length || 0} replies</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded: Replies */}
              {expandedPost === post.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  {post.replies && post.replies.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {post.replies.map((reply: any, idx: number) => (
                        <div key={reply.id || idx} className="bg-white rounded-xl p-3 border border-gray-100">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-bold text-gray-700">{reply.authorName || reply.author}</span>
                            {reply.createdAt && <span className="text-[11px] text-gray-400">{timeAgo(reply.createdAt)}</span>}
                          </div>
                          <p className="text-sm text-gray-600">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mb-4">No replies yet. Be the first!</p>
                  )}

                  {/* Reply Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleReply(post.id); }}
                    />
                    <button
                      onClick={() => handleReply(post.id)}
                      disabled={!replyText.trim()}
                      className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forum;
