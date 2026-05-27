package com.skylite.movie_catalog_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.skylite.movie_catalog_service.entity.Movie;
import com.skylite.movie_catalog_service.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDate;

@SpringBootTest
class MovieCatalogServiceApplicationTests {

	@Autowired
	private MovieRepository movieRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void seedMovies() {
		// Clear existing if desired, or check before inserting
		// For a clean seed, let's delete all existing movies first
		movieRepository.deleteAll();

		// Movie 1: Inception
		Movie inception = new Movie();
		inception.setTitle("Inception");
		inception.setDescription("A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.");
		inception.setGenre("Sci-Fi, Action");
		inception.setDuration(148);
		inception.setLanguage("English");
		inception.setReleaseDate(LocalDate.of(2010, 7, 16));
		inception.setPosterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000");
		inception.setTrailerUrl("https://www.youtube.com/embed/YoHD9XEInc0");
		inception.setStatus("now_showing");
		movieRepository.save(inception);

		// Movie 2: Interstellar
		Movie interstellar = new Movie();
		interstellar.setTitle("Interstellar");
		interstellar.setDescription("A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.");
		interstellar.setGenre("Sci-Fi, Drama");
		interstellar.setDuration(169);
		interstellar.setLanguage("English");
		interstellar.setReleaseDate(LocalDate.of(2014, 11, 7));
		interstellar.setPosterUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000");
		interstellar.setTrailerUrl("https://www.youtube.com/embed/zSWdZAIGaeo");
		interstellar.setStatus("now_showing");
		movieRepository.save(interstellar);

		// Movie 3: The Dark Knight
		Movie darkKnight = new Movie();
		darkKnight.setTitle("The Dark Knight");
		darkKnight.setDescription("When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.");
		darkKnight.setGenre("Action, Crime, Drama");
		darkKnight.setDuration(152);
		darkKnight.setLanguage("English");
		darkKnight.setReleaseDate(LocalDate.of(2008, 7, 18));
		darkKnight.setPosterUrl("https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=1000");
		darkKnight.setTrailerUrl("https://www.youtube.com/embed/EXeTwQWrcwY");
		darkKnight.setStatus("now_showing");
		movieRepository.save(darkKnight);

		// Movie 4: Dune: Part Two
		Movie dune2 = new Movie();
		dune2.setTitle("Dune: Part Two");
		dune2.setDescription("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.");
		dune2.setGenre("Sci-Fi, Adventure");
		dune2.setDuration(166);
		dune2.setLanguage("English");
		dune2.setReleaseDate(LocalDate.of(2024, 3, 1));
		dune2.setPosterUrl("https://images.unsplash.com/photo-1541873676-a18131494184?auto=format&fit=crop&q=80&w=1000");
		dune2.setTrailerUrl("https://www.youtube.com/embed/Way9Dexny3w");
		dune2.setStatus("upcoming");
		movieRepository.save(dune2);

		// Movie 5: Avatar: The Way of Water
		Movie avatar2 = new Movie();
		avatar2.setTitle("Avatar: The Way of Water");
		avatar2.setDescription("Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.");
		avatar2.setGenre("Sci-Fi, Action, Adventure");
		avatar2.setDuration(192);
		avatar2.setLanguage("English");
		avatar2.setReleaseDate(LocalDate.of(2022, 12, 16));
		avatar2.setPosterUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000");
		avatar2.setTrailerUrl("https://www.youtube.com/embed/d9MyW72ELq0");
		avatar2.setStatus("upcoming");
		movieRepository.save(avatar2);

		System.out.println("Sample movies seeded successfully.");
	}

}
