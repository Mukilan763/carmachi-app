import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const getDataPath = () => {
    const p = path.resolve(__dirname, '../data/forum.json');
    if (fs.existsSync(p)) return p;
    return path.join(process.cwd(), 'server', 'data', 'forum.json');
};

const readForumData = (): any[] => {
    try {
        const file = getDataPath();
        if (fs.existsSync(file)) {
            const raw = fs.readFileSync(file, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && Array.isArray(parsed.posts)) return parsed.posts;
        }
    } catch (e) {
        console.error("Error reading forum.json:", e);
    }
    return [];
};

const writeForumData = (posts: any[]) => {
    try {
        const file = getDataPath();
        fs.writeFileSync(file, JSON.stringify(posts, null, 2));
    } catch (e) {
        console.error("Error writing forum.json:", e);
    }
};

router.get('/posts', (req, res) => {
    let posts = readForumData();
    const { category, carId, sortBy, search } = req.query;
    
    if (category && category !== 'all') {
        posts = posts.filter((p: any) => p.category?.toLowerCase() === (category as string).toLowerCase());
    }
    if (carId) {
        posts = posts.filter((p: any) => p.carId === carId);
    }
    if (search) {
        const q = (search as string).toLowerCase();
        posts = posts.filter((p: any) => 
            p.title?.toLowerCase().includes(q) || 
            p.content?.toLowerCase().includes(q) ||
            p.authorName?.toLowerCase().includes(q) ||
            (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
        );
    }
    
    if (sortBy === 'recent' || !sortBy) {
        posts.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'likes' || sortBy === 'popular') {
        posts.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
    }
    
    res.json(posts);
});

router.post('/posts', (req, res) => {
    const posts = readForumData();
    const { title, content, authorName, category, carId, rating, tags, city } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
    }

    const newPost = {
        id: `post-${Date.now()}`,
        title,
        content,
        authorName: authorName || 'Car Enthusiast',
        category: category || 'review',
        carId: carId || null,
        city: city || 'India',
        rating: Number(rating) || 5,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
        tags: Array.isArray(tags) ? tags : ['discussion']
    };
    
    posts.unshift(newPost);
    writeForumData(posts);
    
    res.status(201).json(newPost);
});

router.post('/posts/:id/reply', (req, res) => {
    const posts = readForumData();
    const post = posts.find((p: any) => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    const { content, authorName } = req.body;
    if (!content) {
        return res.status(400).json({ error: "Reply content cannot be empty." });
    }

    const reply = {
        id: `reply-${Date.now()}`,
        author: authorName || 'Automotive Member',
        authorName: authorName || 'Automotive Member',
        content,
        createdAt: new Date().toISOString(),
        likes: 0
    };
    
    post.replies = post.replies || [];
    post.replies.push(reply);
    writeForumData(posts);
    
    res.status(201).json(reply);
});

router.post('/posts/:id/like', (req, res) => {
    const posts = readForumData();
    const post = posts.find((p: any) => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    post.likes = (post.likes || 0) + 1;
    writeForumData(posts);
    
    res.json({ likes: post.likes });
});

export default router;
