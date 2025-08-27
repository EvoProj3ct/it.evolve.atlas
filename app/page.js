import ScrollProgress from "@/components/ScrollProgress";
import WindowEffects from "@/components/WindowEffects";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <WindowEffects />

      <section id="intro" className="home-section">
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">Benvenuto in Evolve</h2>
          <p className="description">
            Evolve è la tua officina digitale: realizziamo software su misura e
            prototipi in stampa 3D con dispositivi PLA dotati di NFC. Con
            soluzioni come E-Linker ed E-Talk aiutiamo persone e oggetti a
            comunicare, offrendo a ogni impresa l'accesso all'innovazione. Offriamo
            consulenza e strumenti integrati per ottimizzare e innovare i processi
            aziendali delle piccole e medie imprese: anche tu ora te lo puoi
            permettere!
          </p>
        </div>
      </section>

      <section id="chi-siamo" className="home-section">
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">Chi Siamo</h2>
          <p className="description">
            Siamo un team di professionisti appassionati di tecnologia e cultura
            8-bit. Uniamo esperienza in sviluppo, IoT e design per accompagnarti
            con cordialità verso il futuro digitale.
          </p>
        </div>
      </section>

      <section id="prodotti" className="home-section">
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">I Nostri Prodotti</h2>
          <p className="description">
            Dal nostro E-Linker all'E-Talk, sviluppiamo dispositivi e piattaforme
            che integrano NFC e stampa 3D per connettere ciò che conta. Ogni
            prodotto è pensato per essere semplice, fluo e pronto all'uso.
          </p>
        </div>
      </section>

      <section id="servizi" className="home-section">
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">I Nostri Servizi</h2>
          <p className="description">
            Offriamo soluzioni integrate e consulenza personalizzata per
            ottimizzare i processi aziendali. Dallo sviluppo software alla
            prototipazione rapida, ti guidiamo nell'innovazione della tua PMI.
          </p>
        </div>
      </section>

      <section id="testimonianze" className="home-section">
        <div className="content window">
          <div className="window-bar">
            <span className="window-btn minimize"></span>
            <span className="window-btn close"></span>
          </div>
          <h2 className="title">Cosa Dicono di Noi</h2>
          <p className="description">
            "I ragazzi di Evolve hanno trasformato le nostre idee in realtà in
            pochissimo tempo!"<br />"Finalmente un partner che parla la lingua
            delle piccole imprese."
          </p>
        </div>
      </section>

      <section id="contatti" className="home-section">
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
      </section>

    </>
  );
}
