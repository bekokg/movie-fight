
const noImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1200px-No_image_available.svg.png';

const autoCompleteConfig = {
  renderOption(movie) {
    return `
    <img src="${movie.Poster !== 'N/A' ? movie.Poster : noImage}" alt='Movie Poster'/>
    ${movie.Title} (${movie.Year})
  `
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: 'ba9ac5f2',
        s: searchTerm
      }
    });
    if(response.data.Error) {
      return [];
    }
    return response.data.Search;
  }
}

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left')
  }
});

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right')
  }
});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: 'ba9ac5f2',
      i: movie.imdbID
    }
  });
  summaryElement.innerHTML = movieTemplate(response.data);
  
  if(side === 'left') {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }

  if(leftMovie && rightMovie) {
    runComparison();
  }
}

const runComparison = () => {
  const leftSideStats = document.querySelectorAll('#left-summary .notification');
  const rightSideStats = document.querySelectorAll('#right-summary .notification');

  leftSideStats.forEach((leftStat, idx) => {
    const rightStat = rightSideStats[idx];

    const leftSideValue = parseInt(leftStat.dataset.value);
    const rightSideValue = parseInt(rightStat.dataset.value);
    if(leftSideValue > rightSideValue) {
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    } else {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    }
  });
}

const movieTemplate = (movieDetail) => {
  const { Poster, Title, Genre, Plot, Awards, BoxOffice, Metascore, imdbRating, imdbVotes } = movieDetail;

  const dollars = parseInt(BoxOffice.replace(/\$/g, '').replace(/,/g, ''))
  const metaScore = parseInt(Metascore);
  const IMDBRating = parseFloat(imdbRating);
  const IMDBVotes = parseInt(imdbVotes.replace(/,/g, ''));
  const awards = Awards.split(' ').reduce((prev, word) => {
    const value = parseInt(word);
    if(isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${Poster === 'N/A' ? noImage : Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content" >
          <h1>${Title}</h1>
          <h4>${Genre}</h4>
          <p>${Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metaScore} class="notification is-primary">
      <p class="title">${Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${IMDBRating} class="notification is-primary">
      <p class="title">${imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${IMDBVotes} class="notification is-primary">
      <p class="title">${imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
}