import ScrollProgress from "@/components/ScrollProgress";
import ParallaxAliens from "@/components/ParallaxAliens";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <ParallaxAliens />

      <section id="intro" className="home-section">
        <img src="/alien1.svg" alt="" className="alien alien-left blue" data-speed="2" />
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">Benvenuto in Evolve</h2>
          <p className="description">
            Evolve è una società di consulenza informatica e stampa 3D. Offriamo
            supporto nello sviluppo software, nella gestione di infrastrutture e
            nella realizzazione di prototipi personalizzati.
          </p>
        </div>
        <img src="/alien2.svg" alt="" className="alien alien-right red" data-speed="2.5" />
      </section>

      <section id="chi-siamo" className="home-section">
        <img src="/alien3.svg" alt="" className="alien alien-left pink" data-speed="2" />
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">Chi Siamo</h2>
          <p className="description">
            Siamo un team di appassionati di tecnologia con un tocco retro.
            Crediamo nell'innovazione e nello stile 8-bit.
          </p>
        </div>
        <img src="/alien1.svg" alt="" className="alien alien-right blue" data-speed="2.5" />
      </section>

      <section id="prodotti" className="home-section">
        <img src="/alien2.svg" alt="" className="alien alien-left red" data-speed="2" />
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">I Nostri Prodotti</h2>
          <p className="description">
            Dalla stampa 3D agli strumenti software, offriamo prodotti per dare
            vita ai tuoi progetti.
          </p>
        </div>
        <img src="/alien3.svg" alt="" className="alien alien-right pink" data-speed="2.5" />
      </section>

      <section id="servizi" className="home-section">
        <img src="/alien1.svg" alt="" className="alien alien-left blue" data-speed="2" />
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">I Nostri Servizi</h2>
          <p className="description">
            Consulenza, sviluppo e supporto tecnico per spingere la tua azienda
            oltre i confini.
          </p>
        </div>
        <img src="/alien2.svg" alt="" className="alien alien-right red" data-speed="2.5" />
      </section>

      <section id="testimonianze" className="home-section">
        <img src="/alien3.svg" alt="" className="alien alien-left pink" data-speed="2" />
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">Cosa Dicono di Noi</h2>
          <p className="description">"Incredibile esperienza, consigliatissimi!"</p>
        </div>
        <img src="/alien1.svg" alt="" className="alien alien-right blue" data-speed="2.5" />
      </section>

      <section id="contatti" className="home-section">
        <img src="/alien2.svg" alt="" className="alien alien-left red" data-speed="2" />
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">Contattaci</h2>
          <form
            className="form"
            action="mailto:info@example.com"
            method="post"
            encType="text/plain"
          >
            <input type="text" name="name" placeholder="Nome" required />
            <input type="email" name="email" placeholder="Email" required />
            <textarea name="message" rows="4" placeholder="Messaggio" required />
            <button type="submit">Invia</button>
          </form>
        </div>
        <img src="/alien3.svg" alt="" className="alien alien-right pink" data-speed="2.5" />
      </section>

      <div className="space-ship-container">
        <img src="/ship.svg" alt="" className="bottom-ship pink" />
      </div>
    </>
  );
}
