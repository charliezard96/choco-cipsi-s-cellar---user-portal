import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { DATA_CONTROLLER, DATA_PROCESSORS, PRIVACY_LAST_UPDATED } from '../config/legal';

const lastUpdatedLabel = new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' })
  .format(new Date(PRIVACY_LAST_UPDATED));

const ContactLink: React.FC = () => (
  <a href={`mailto:${DATA_CONTROLLER.email}`} className="font-semibold text-primary underline underline-offset-4 hover:text-secondary">
    {DATA_CONTROLLER.email}
  </a>
);

const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-secondary">
    {children}
  </a>
);

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 space-y-4">
    <h2 id={`${id}-title`} className="font-serif text-2xl font-bold text-primary">{title}</h2>
    {children}
  </section>
);

export const PrivacyView: React.FC = () => {
  usePageMeta('Privacy e cookie', 'Come DeCacao Cellar tratta i tuoi dati personali e quali tecnologie usa nel browser.');

  return (
    <article className="animate-in fade-in duration-700 max-w-3xl mx-auto text-on-surface-variant leading-relaxed space-y-12">
      <header>
        <h1 className="text-5xl font-bold text-primary mb-4">Informativa privacy e cookie</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Ultimo aggiornamento: {lastUpdatedLabel}</p>
      </header>

      <Section id="titolare" title="1. Chi è il titolare del trattamento">
        <p>
          DeCacao Cellar è un progetto amatoriale e non commerciale. Il titolare del trattamento dei dati è{' '}
          <strong className="text-on-surface">{DATA_CONTROLLER.name}</strong>, persona fisica, che puoi contattare
          per qualsiasi domanda o richiesta sulla privacy all'indirizzo <ContactLink />.
        </p>
      </Section>

      <Section id="dati" title="2. Quali dati raccogliamo">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-on-surface">Dati dell'account</strong>: email e password. La password è conservata solo in forma cifrata e nessuno può leggerla.</li>
          <li><strong className="text-on-surface">Dati del profilo</strong>: username, nome, cognome, foto profilo, biografia e origine preferita, se scegli di inserirli.</li>
          <li><strong className="text-on-surface">Contenuti che crei</strong>: valutazioni delle tavolette, voti sulle note aromatiche, tavolette e note salvate nella tua cantina.</li>
          <li><strong className="text-on-surface">Accesso con Google</strong>: se lo usi, Google ci comunica nome, email e foto del tuo account.</li>
          <li><strong className="text-on-surface">Dati tecnici</strong>: indirizzo IP e informazioni sul browser, registrati automaticamente dai fornitori di hosting per far funzionare e proteggere il sito.</li>
        </ul>
        <p>Puoi consultare il sito senza registrarti: in quel caso trattiamo solo i dati tecnici.</p>
      </Section>

      <Section id="finalita" title="3. Perché li usiamo">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-on-surface">Fornirti il servizio</strong> che hai chiesto registrandoti: account, profilo,
            valutazioni, cantina e community, comprese le email di servizio (conferma della registrazione e recupero password).
            Base giuridica: esecuzione del servizio richiesto (art. 6.1.b GDPR).
          </li>
          <li>
            <strong className="text-on-surface">Sicurezza e funzionamento del sito</strong>, tramite i dati tecnici.
            Base giuridica: legittimo interesse a mantenere il sito sicuro (art. 6.1.f GDPR).
          </li>
        </ul>
        <p>
          Non usiamo i tuoi dati per pubblicità, newsletter o profilazione, e non li vendiamo né li cediamo a nessuno.
        </p>
      </Section>

      <Section id="pubblico" title="4. Cosa vedono gli altri">
        <p>
          DeCacao Cellar ha una community: <strong className="text-on-surface">il tuo profilo è pubblico</strong> ed è visibile
          a chiunque visiti il sito, anche senza essere registrato. Sono pubblici username, nome, cognome, foto profilo,
          biografia, origine preferita e il numero di valutazioni che hai dato. Le tue valutazioni e i tuoi voti sugli aromi
          contribuiscono inoltre alle medie e alle statistiche mostrate per ogni tavoletta.
        </p>
        <p>
          La tua email non viene mai mostrata. Nome, cognome, foto e biografia sono facoltativi: puoi modificarli o lasciarli
          vuoti in qualsiasi momento dalla pagina del tuo profilo.
        </p>
      </Section>

      <Section id="fornitori" title="5. Fornitori che trattano i dati">
        <p>
          Per funzionare il sito si appoggia a questi servizi esterni, che trattano i dati per nostro conto e solo per lo scopo indicato:
        </p>
        <ul className="space-y-3">
          {DATA_PROCESSORS.map(p => (
            <li key={p.name} className="border-l-2 border-secondary/40 pl-4">
              <strong className="text-on-surface">{p.name}</strong> — {p.purpose}{' '}
              <ExternalLink href={p.privacyUrl}>Informativa di {p.name}</ExternalLink>
            </li>
          ))}
        </ul>
        <p>
          Alcuni di questi fornitori hanno sede negli Stati Uniti. I trasferimenti di dati fuori dall'Unione Europea avvengono
          sulla base del EU-U.S. Data Privacy Framework o delle clausole contrattuali standard approvate dalla Commissione Europea.
        </p>
      </Section>

      <Section id="conservazione" title="6. Per quanto tempo li conserviamo">
        <p>
          Conserviamo i dati dell'account, del profilo e i contenuti che crei finché il tuo account resta attivo. Se chiedi
          la cancellazione dell'account, eliminiamo i tuoi dati entro 30 giorni. I dati tecnici restano nei log dei fornitori
          solo per il tempo previsto dalle loro politiche, di norma pochi giorni o settimane.
        </p>
      </Section>

      <Section id="diritti" title="7. I tuoi diritti">
        <p>In qualsiasi momento puoi chiedere di:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>accedere ai tuoi dati e riceverne una copia (artt. 15 e 20 GDPR);</li>
          <li>correggerli o aggiornarli (art. 16);</li>
          <li>cancellarli, compreso l'intero account (art. 17);</li>
          <li>limitarne il trattamento o opporti al trattamento basato sul legittimo interesse (artt. 18 e 21).</li>
        </ul>
        <p>
          Scrivi a <ContactLink />: ti risponderemo entro 30 giorni. Se ritieni che i tuoi dati siano trattati in modo non
          corretto, puoi anche presentare un reclamo al{' '}
          <ExternalLink href="https://www.garanteprivacy.it">Garante per la protezione dei dati personali</ExternalLink>.
        </p>
      </Section>

      <Section id="cookie" title="8. Cookie e tecnologie simili">
        <p>
          DeCacao Cellar <strong className="text-on-surface">non usa cookie di profilazione, pubblicitari o di statistica</strong>,
          né strumenti di tracciamento di terze parti.
        </p>
        <p>
          Quando accedi, il sito salva nella memoria del tuo browser (localStorage) un dato tecnico che serve a mantenerti
          collegato tra una visita e l'altra. È uno strumento strettamente necessario al servizio che hai richiesto e, secondo
          le Linee guida del Garante sui cookie (10 giugno 2021), non richiede il tuo consenso. Viene cancellato quando esci
          dall'account, e puoi eliminarlo in qualsiasi momento dalle impostazioni del browser.
        </p>
        <p>
          I caratteri tipografici e la mappa delle origini sono ospitati direttamente sul nostro sito, senza contattare
          servizi esterni. Se usi "Accedi con Google", durante l'accesso Google può impostare propri cookie sul suo sito,
          secondo la sua informativa.
        </p>
      </Section>

      <Section id="minori" title="9. Minori">
        <p>
          Il servizio non è rivolto ai minori di 14 anni, che non possono registrarsi senza il consenso di chi esercita la
          responsabilità genitoriale.
        </p>
      </Section>

      <Section id="modifiche" title="10. Modifiche a questa informativa">
        <p>
          Potremmo aggiornare questa informativa, per esempio se aggiungiamo nuove funzioni o cambiamo fornitori. La data
          dell'ultimo aggiornamento è sempre indicata in cima alla pagina; in caso di modifiche importanti avviseremo gli
          utenti registrati.
        </p>
      </Section>
    </article>
  );
};
