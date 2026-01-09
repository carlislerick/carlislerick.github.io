// GitHub username - extracted from the repository URL
const GITHUB_USERNAME = 'carlislerick';

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fetch user profile information
async function fetchUserProfile() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const data = await response.json();
        
        // Update profile information
        const avatar = document.getElementById('avatar');
        if (data.avatar_url) {
            avatar.src = data.avatar_url;
            avatar.alt = `${data.name || GITHUB_USERNAME}'s avatar`;
            avatar.classList.add('loaded');
        }
        
        const bio = document.getElementById('bio');
        if (data.bio) {
            bio.innerHTML = `<p>${escapeHtml(data.bio)}</p>`;
        }
        
        // Update header with actual name if available
        if (data.name) {
            document.querySelector('header h1').textContent = data.name;
        }
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

// Fetch repositories from GitHub API
async function fetchRepositories() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error('Failed to fetch repositories');
        
        const repos = await response.json();
        
        // Filter out forked repos and sort by stars
        const ownRepos = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count);
        
        displayRepositories(ownRepos);
    } catch (error) {
        console.error('Error fetching repositories:', error);
        document.getElementById('loading').textContent = 'Failed to load repositories. Please try again later.';
    }
}

// Display repositories in the grid
function displayRepositories(repos) {
    const loadingEl = document.getElementById('loading');
    const repoContainer = document.getElementById('repositories');
    
    loadingEl.style.display = 'none';
    
    if (repos.length === 0) {
        repoContainer.innerHTML = '<p style="text-align: center; color: #666;">No repositories found.</p>';
        return;
    }
    
    repoContainer.innerHTML = repos.map(repo => `
        <div class="repo-card" tabindex="0" role="link" onclick="window.open('${escapeHtml(repo.html_url)}', '_blank')" onkeypress="if(event.key==='Enter'||event.key===' ')window.open('${escapeHtml(repo.html_url)}', '_blank')">
            <h3>
                <a href="${escapeHtml(repo.html_url)}" target="_blank" onclick="event.stopPropagation()">
                    ${escapeHtml(repo.name)}
                </a>
            </h3>
            <p class="description">${escapeHtml(repo.description || 'No description available')}</p>
            <div class="meta">
                ${repo.language ? `<span class="language">${escapeHtml(repo.language)}</span>` : ''}
                ${repo.stargazers_count > 0 ? `<span class="stars">${repo.stargazers_count}</span>` : ''}
                ${repo.forks_count > 0 ? `<span class="forks">${repo.forks_count}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    fetchRepositories();
});
