import { BasicContainerBox, HeadTitle } from "../components/BasicComponents";

export function LegalNoticePage({}) {
  return (
    <BasicContainerBox>
      <HeadTitle title="Legal Notice" />
      <h1>Impressum</h1>
      <h2>Anbieter</h2>
      <p>Hannes Rüffer</p>
      <h2>Kontakt</h2>
      <ul>
        <li>E-Mail: viddie@hotmail.de</li>
      </ul>
      <h2>Haftungsausschluss</h2>
      <p>
        Wir sind für die Inhalte unserer Internetseiten nach den Maßgaben der allgemeinen Gesetzen
        verantwortlich. Alle Inhalte werden mit der gebotenen Sorgfalt und nach bestem Wissen erstellt. Soweit
        wir auf unseren Internetseiten mittels Hyperlink auf Internetseiten Dritter verweisen, können wir
        keine Gewähr für die fortwährende Aktualität, Richtigkeit und Vollständigkeit der verlinkten Inhalte
        übernehmen, da diese Inhalte außerhalb unseres Verantwortungsbereichs liegen und wir auf die
        zukünftige Gestaltung keinen Einfluss haben. Sollten aus Ihrer Sicht Inhalte gegen geltendes Recht
        verstoßen oder unangemessen sein, teilen Sie uns dies bitte mit.
      </p>
      <p>
        Die rechtlichen Hinweise auf dieser Seite sowie alle Fragen und Streitigkeiten im Zusammenhang mit der
        Gestaltung dieser Internetseite unterliegen dem Recht der Bundesrepublik Deutschland.
      </p>
      <h2>Urheberrechtshinweis</h2>
      <p>
        Die auf unserer Internetseite vorhandenen Texte, Bilder, Fotos, Videos oder Grafiken unterliegen in
        der Regel dem Schutz des Urheberrechts. Jede unberechtigte Verwendung (insbesondere die
        Vervielfältigung, Bearbeitung oder Verbreitung) dieser urheberrechtsgeschützten Inhalte ist daher
        untersagt. Wenn Sie beabsichtigen, diese Inhalte oder Teile davon zu verwenden, kontaktieren Sie uns
        bitte im Voraus unter den oben stehenden Angaben. Soweit wir nicht selbst Inhaber der benötigten
        urheberrechtlichen Nutzungsrechte sein sollten, bemühen wir uns, einen Kontakt zum Berechtigten zu
        vermitteln.
      </p>
    </BasicContainerBox>
  );
}
