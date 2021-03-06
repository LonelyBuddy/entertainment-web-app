import Head from 'next/head';
import requests from '../utils/requests';
import { certification, Movie } from '../typings';
import { Search } from '../components/Search';
import { Trending } from '../components/Trending';
import { Title } from '../components/Title';
import { MediaCard } from '../components/MediaCard';

export type Props = {
  trendingNow: Movie[];
  recommendations: Movie[];
  certifications: certification[];
};

const Home = ({ trendingNow, recommendations, certifications }: Props) => {
  return (
    <>
      <Head>
        <title>Entertainment-web-app</title>
        <link rel="icon" href="/static/favicon.ico" />
      </Head>

      <Search placeholderText="Search for movies or TV series" />

      <Trending trendingNow={trendingNow} certifications={certifications} />

      <section className="mt-6 mb-16">
        <Title text="Recommended for you" />
        <div className="grid-container">
          {recommendations.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              certifications={certifications}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const [trendingNow, popularMovies, popularTVs] = await Promise.all([
    fetch(requests.fetchTrending).then((res) => res.json()),
    fetch(requests.fetchMovies).then((res) => res.json()),
    fetch(requests.fetchTVs).then((res) => res.json()),
  ]);

  // get certifications or ratings for each media
  const certifications = await Promise.all(
    [
      ...trendingNow.results,
      ...popularMovies.results,
      ...popularTVs.results,
    ].map((media: Movie) =>
      media.media_type === 'movie'
        ? fetch(requests.fetchMovieCertificationById(media.id)).then((res) =>
            res.json()
          )
        : fetch(requests.fetchTVRatingById(media.id)).then((res) => res.json())
    )
  );

  const recommendations = [
    ...popularMovies.results.map((movie: Movie) => ({
      ...movie,
      media_type: 'movie',
    })),
    ...popularTVs.results.map((tv: Movie) => ({ ...tv, media_type: 'tv' })),
  ].sort(() => Math.random() - 0.5);

  return {
    props: {
      trendingNow: trendingNow.results,
      recommendations,
      certifications,
    },
  };
};
