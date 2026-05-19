// =====================================================
// Admin Form Logic
// =====================================================

function generateId() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `news-${dateStr}-${random}`;
}

function generateJSON() {
    const title = document.getElementById('title').value;
    const summary = document.getElementById('summary').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const image = document.getElementById('image').value;
    const author = document.getElementById('author').value;
    const tagsInput = document.getElementById('tags').value;
    const isFeatured = document.getElementById('isFeatured').checked;
    const isBreaking = document.getElementById('isBreaking').checked;

    if (!title || !summary || !content) {
        alert("অনুগ্রহ করে শিরোনাম, সারসংক্ষেপ এবং মূল সংবাদ পূরণ করুন।");
        return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newsObject = {
        id: generateId(),
        title: title,
        summary: summary,
        content: content, // Keep raw HTML
        category: category,
        image: image,
        author: author,
        date: dateStr,
        isFeatured: isFeatured,
        isBreaking: isBreaking,
        tags: tags
    };

    // Format output string to be JS friendly
    const outputString = `{
    id: "${newsObject.id}",
    title: "${newsObject.title.replace(/"/g, '\\"')}",
    summary: "${newsObject.summary.replace(/"/g, '\\"')}",
    content: \`${newsObject.content}\`,
    category: "${newsObject.category}",
    image: "${newsObject.image}",
    author: "${newsObject.author}",
    date: "${newsObject.date}",
    isFeatured: ${newsObject.isFeatured},
    isBreaking: ${newsObject.isBreaking},
    tags: ${JSON.stringify(newsObject.tags)}
  },`;

    document.getElementById('json-output').innerText = outputString;
}

function copyJSON() {
    const text = document.getElementById('json-output').innerText;
    if (text.includes('// আপনার তৈরি')) return;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerText = 'Copied!';
        btn.style.background = '#059669';
        
        setTimeout(() => {
            btn.innerText = 'Copy';
            btn.style.background = 'rgba(255,255,255,0.2)';
        }, 2000);
    });
}
