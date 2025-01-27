document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/scores')
      .then((res) => res.json())
      .then((scores) => {
        const scoresList = document.getElementById('scores-list');
        scores.forEach((score) => {
          const li = document.createElement('li');
          li.textContent = `${score.name}: ${score.score}`;
          scoresList.appendChild(li);
        });
      })
      .catch((err) => console.error('Error fetching scores:', err));
  });
  