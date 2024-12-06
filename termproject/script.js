$(document).ready(function () {
    var apiKey = '8d8b730492be3a5dd552a16917558587';
    var baseUrl = 'https://api.themoviedb.org/3';
    var imageBaseUrl = 'https://image.tmdb.org/t/p/w500'; // full-size poster images

    // default view mode is list
    $('#results_section').addClass('list-view');

    // handle search button click
    $('#search_button').click(() => {
        var query = $('#search_input').val().trim();
        if (query) fetchData('/search/movie', { query });
    });

    // handle popular movies button
    $('#popular_movies').click(() => fetchData('/movie/popular'));

    $('#search_movies').click(function () {
        location.reload(); // refreshes the page
    });
    

    // handle TV show discovery button
    $('#discover_tv').click(() => fetchData('/discover/tv'));

    // apply filters to movies
    $('#apply_filters').click(() => {
        var sortBy = $('#sort_by').val();
        fetchData('/discover/movie', { sort_by: sortBy });
    });

    // switch to list view
    $('#list_view').click(() => {
        $('#results_section').removeClass('grid-view').addClass('list-view');
        $('#list_view').addClass('active');
        $('#grid_view').removeClass('active');
    });

    // switch to grid view
    $('#grid_view').click(() => {
        $('#results_section').removeClass('list-view').addClass('grid-view');
        $('#grid_view').addClass('active');
        $('#list_view').removeClass('active');
    });

    // fetch data from TMDb API
    function fetchData(endpoint, params = {}, page = 1) {
        params.api_key = apiKey;
        params.page = page;

        $.ajax({
            url: baseUrl + endpoint,
            method: 'GET',
            data: params,
            success: (response) => {
                displayResults(response.results, endpoint);
                if (response.total_pages > 1) {
                    displayPagination(response.page, response.total_pages, endpoint, params);
                }
            }
        });
    }

    // display search results in the results section
    function displayResults(results, endpoint) {
        var resultsHTML = results.map((item) => {
            var title = item.title || item.name;
            var releaseDate = item.release_date || item.first_air_date;
            var rating = item.vote_average || 'N/A';
            var thumbnail = item.poster_path ? imageBaseUrl + item.poster_path : 'placeholder.jpg';

            return `
                <div class="result-item">
                    <img src="${thumbnail}" alt="${title} Poster" class="thumbnail">
                    <div class="details">
                        <h3>${title}</h3>
                        <p>Release Date: ${releaseDate}</p>
                        <p>Rating: ${rating}/10</p>
                        <button class="details-button" data-id="${item.id}" data-type="${endpoint.includes('tv') ? 'tv' : 'movie'}">View Details</button>
                    </div>
                </div>
            `;
        }).join('');

        $('#results_section').html(resultsHTML);

        // handle details button click
        $('.details-button').off('click').on('click', function () {
            var id = $(this).data('id');
            var type = $(this).data('type');
            fetchDetails(id, type);
        });
    }

    // fetch details of a specific movie or TV show
    function fetchDetails(id, type) {
        $.ajax({
            url: `${baseUrl}/${type}/${id}`,
            method: 'GET',
            data: { api_key: apiKey },
            success: (data) => {
                $.when(fetchCast(id, type), fetchReviews(id, type)).done((cast, reviews) => {
                    showDetails(data, cast[0].cast, reviews[0].results);
                });
            }
        });
    }

    // fetch cast details
    function fetchCast(id, type) {
        return $.ajax({
            url: `${baseUrl}/${type}/${id}/credits`,
            method: 'GET',
            data: { api_key: apiKey }
        });
    }

    // fetch reviews for a movie or TV show
    function fetchReviews(id, type) {
        return $.ajax({
            url: `${baseUrl}/${type}/${id}/reviews`,
            method: 'GET',
            data: { api_key: apiKey }
        });
    }

    // display detailed information
    function showDetails(data, cast, reviews) {
        var castHTML = cast.slice(0, 5).map(person => `
            <li>
                <a href="#" class="cast-member" data-id="${person.id}">${person.name}</a> 
                as ${person.character}
            </li>
        `).join('');
    
        var reviewsHTML = reviews.slice(0, 5).map(review => `
            <div class="review-item">
                <h4>${review.author}</h4>
                <p>${review.content}</p>
            </div>
        `).join('');
    
        $('#main_content').html(`
            <div class="details-page">
                <img src="${data.poster_path ? imageBaseUrl + data.poster_path : 'placeholder.jpg'}" alt="${data.title || data.name}" class="details-poster">
                <div class="details-info">
                    <h2>${data.title || data.name}</h2>
                    <p><strong>Release Date:</strong> ${data.release_date}</p>
                    <p><strong>Rating:</strong> ${data.vote_average}/10</p>
                    <p><strong>Overview:</strong> ${data.overview}</p>
                    <h3>Cast:</h3>
                    <ul>${castHTML}</ul>
                    <h3>Reviews:</h3>
                    <div>${reviewsHTML}</div>
                    <button id="back_button">Back</button>
                </div>
            </div>
        `);
    
        $('#back_button').click(() => location.reload());
    
        $('.cast-member').off('click').on('click', function (e) {
            e.preventDefault();
            var personId = $(this).data('id');
            fetchActorDetails(personId);
        });    

        // handle back button click
        $('#back_button').click(() => location.reload());

        // handle actor link click
        $('.cast-member').off('click').on('click', function (e) {
            e.preventDefault();
            var personId = $(this).data('id');
            fetchActorDetails(personId);
        });
    }

    // fetch actor details
    function fetchActorDetails(personId) {
        $.ajax({
            url: `${baseUrl}/person/${personId}`,
            method: 'GET',
            data: { api_key: apiKey },
            success: (data) => showActorDetails(data)
        });
    }

    // display actor details
    function showActorDetails(data) {
        $('#main_content').html(`
            <div class="actor-details">
                <img src="${data.profile_path ? imageBaseUrl + data.profile_path : 'placeholder.jpg'}" alt="${data.name}" class="actor-poster">
                <div class="actor-info">
                    <h2>${data.name}</h2>
                    <p><strong>Known For:</strong> ${data.known_for_department}</p>
                    <p><strong>Birthdate:</strong> ${data.birthday}</p>
                    <p><strong>Place of Birth:</strong> ${data.place_of_birth}</p>
                    <p><strong>Biography:</strong> ${data.biography}</p>
                    <button id="back_button">Back</button>
                </div>
            </div>
        `);

        $('#back_button').click(() => location.reload());
    }

    // display pagination
    function displayPagination(currentPage, totalPages, endpoint, params) {
        $('#pagination').remove();
        $('#results_section').append('<div id="pagination"></div>');

        var maxPages = Math.min(totalPages, 5);
        for (let i = 1; i <= maxPages; i++) {
            $('#pagination').append(`
                <button class="page-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>
            `);
        }

        $('.page-button').click(function () {
            var page = $(this).data('page');
            fetchData(endpoint, params, page);
        });
    }
});
