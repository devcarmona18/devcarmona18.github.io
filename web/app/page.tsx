import Preloader from '@/components/Preloader';
import SmoothScroll from '@/components/SmoothScroll';
import Cursor from '@/components/Cursor';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Manifiesto from '@/components/Manifiesto';
import Especialidad from '@/components/Especialidad';
import Arsenal from '@/components/Arsenal';
import Trabajo from '@/components/Trabajo';
import Contacto from '@/components/Contacto';

export default function Page() {
  return (
    <>
      <a href="#trabajo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-accent focus:px-4 focus:py-2 focus:text-bg">
        Saltar al contenido
      </a>
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Manifiesto />
        <Especialidad />
        <Arsenal />
        <Trabajo />
        <Contacto />
      </main>
    </>
  );
}
