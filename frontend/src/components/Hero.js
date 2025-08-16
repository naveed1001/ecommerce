import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-cover bg-center h-96 flex items-center justify-center text-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Discover Amazing Products</h1>
        <p className="text-lg md:text-xl mb-6">Shop the latest trends at unbeatable prices!</p>
        <Link
          to="/#products"
          className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition duration-300 shadow-lg"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
};

export default Hero;