#!/usr/bin/env node
// Static, reviewable landing pages. NO deployment.
import fs from "node:fs";
import path from "node:path";

const base=path.resolve("public/tools/photo-size");
const domain="https://arvectum.com";
const app="https://apps.apple.com/app/id6816346084";
const markets={
en:{lang:"en",title:"Compress Photos & PDFs to KB/MB on iPhone | Arvectum",meta:"Free iPhone utility to compress a photo to 100 KB or 1 MB, reduce PDF sizes, resize images in pixels and prepare document photos. Private on-device processing.",heading:"Compress photos and PDFs to the size you need",lead:"Your form says “maximum 100 KB”, “less than 1 MB” or “specific pixel dimensions”? Prepare the file on your iPhone, with a clear before-and-after result.",cta:"Get the free iPhone app",h2:["Compress a photo to 100 KB, 500 KB or 1 MB","Reduce a PDF for an upload form","Resize an image in pixels","Prepare international document photos"],body:["Choose a KB/MB limit or enter your own. Check the real output size before saving or sharing.","Reduce a PDF without sending it to an online converter. Very strong compression can turn text pages into images, making text selection unavailable.","Set pixel dimensions and export JPEG, PNG or HEIC where supported. Review the image before you save.","Use technical presets for selected passports and visas, including US digital visa and India e-Visa. Final acceptance depends on the authority."],privacy:"Your photo and PDF content is processed locally on your iPhone. An internet connection may be used to load ads; your files are not uploaded for processing.",faq:[["Will the result always be under the target limit?","The app checks the output size; the achievable result depends on the source file and chosen settings."],["Can I compress a PDF without a website?","Yes. PDF processing runs on the iPhone, and strong compression may rasterize pages."],["Can it guarantee passport photo acceptance?","No. The presets only prepare technical file properties. Check the applicable official rules."]],alt:"Actual iPhone app showing before and after photo compression",more:"Compress PDF files"},
es:{lang:"es",title:"Comprimir fotos y PDF a 100 KB o 1 MB en iPhone | Arvectum",meta:"Aplicación gratis para iPhone: comprimir fotos y PDF hasta un límite en KB o MB, cambiar las dimensiones en píxeles y preparar fotos para trámites.",heading:"Comprime fotos y PDF al tamaño que necesitas",lead:"¿El formulario exige un máximo de 100 KB, 500 KB o 1 MB? Prepara la foto o el PDF en tu iPhone sin subir los archivos a una web.",cta:"Descargar gratis para iPhone",h2:["Reduce fotos a 100 KB, 500 KB o 1 MB","Comprime PDF para formularios","Cambia las dimensiones en píxeles","Prepara fotos para documentos"],body:["Elige el límite de KB o MB y consulta el tamaño real antes de guardar o compartir el archivo.","La compresión de PDF se hace en el dispositivo. Si es muy intensa, puede convertir las páginas en imágenes y eliminar el texto seleccionable.","Ajusta la anchura y altura, conserva las proporciones si lo necesitas y exporta JPEG, PNG o HEIC cuando sea compatible.","Utiliza plantillas técnicas para algunos pasaportes y visados internacionales. No se garantiza la aceptación oficial."],privacy:"Las fotos y los PDF se procesan en el iPhone. Se puede usar internet para la publicidad, pero los archivos no se envían para procesarlos.",faq:[["¿Puedo reducir una foto a 100 KB?","Puedes fijar 100 KB como límite; el resultado depende del archivo original y de los ajustes."],["¿Funciona sin un conversor web?","Sí. El contenido de los archivos se procesa localmente en el dispositivo."],["¿Garantiza que acepten mi foto de documento?","No. Solo prepara sus parámetros técnicos. Consulta los requisitos oficiales."]],alt:"Captura real de iPhone con comparación antes y después",more:"Compresión de PDF"},
"pt-br":{lang:"pt-BR",title:"Comprimir Foto e PDF para 100 KB ou 1 MB | Arvectum",meta:"App grátis para iPhone: comprima fotos e PDFs para limites em KB/MB, redimensione imagens em pixels e prepare arquivos para formulários.",heading:"Comprima fotos e PDFs para o tamanho solicitado",lead:"O formulário só aceita arquivos de 100 KB, 500 KB ou 1 MB? Reduza fotos e PDFs no seu iPhone, sem enviar o conteúdo para um site.",cta:"Baixar grátis para iPhone",h2:["Reduza fotos para 100 KB, 500 KB ou 1 MB","Comprima PDFs para enviar","Redimensione imagens em pixels","Prepare fotos para documentos"],body:["Escolha o limite em KB ou MB e confira o tamanho real do arquivo antes de salvar.","O PDF é processado localmente. Compressão intensa pode transformar páginas em imagens e impedir a seleção de texto.","Ajuste largura e altura em pixels, preserve a proporção quando necessário e exporte JPEG, PNG ou HEIC em modos compatíveis.","Use modelos técnicos para alguns vistos e passaportes internacionais. A aceitação oficial não é garantida."],privacy:"O conteúdo de fotos e PDFs é processado no iPhone. A internet pode ser utilizada para anúncios, não para processar seus arquivos.",faq:[["Posso comprimir uma foto para 100 KB?","Defina 100 KB como limite e confira o resultado; a qualidade possível depende da foto original."],["Os PDFs são enviados para algum site?","Não. O processamento de PDF ocorre no dispositivo."],["As fotos de documentos serão aceitas?","Não há garantia. Confira as regras oficiais do documento."]],alt:"Tela real do iPhone mostrando foto antes e depois da compressão",more:"Compressão de PDF"},
de:{lang:"de",title:"Fotos und PDF auf 100 KB oder 1 MB verkleinern | Arvectum",meta:"Kostenlose iPhone-App zum Komprimieren von Fotos und PDFs auf KB/MB-Grenzen. Pixelmaße ändern, Datei prüfen und lokal auf dem Gerät verarbeiten.",heading:"Fotos und PDFs auf die gewünschte Größe verkleinern",lead:"Das Formular verlangt maximal 100 KB, 500 KB oder 1 MB? Bereite Bilder und PDFs auf dem iPhone für den Upload vor.",cta:"Kostenlose iPhone-App laden",h2:["Fotos auf 100 KB, 500 KB oder 1 MB reduzieren","PDF-Dateien für Uploads komprimieren","Bildmaße in Pixeln ändern","Fotos für Dokumente vorbereiten"],body:["Lege die Dateigröße in KB oder MB fest. Prüfe die tatsächliche Größe, bevor du das Ergebnis speicherst.","PDF-Dateien werden auf dem Gerät verarbeitet. Starke Komprimierung kann Seiten in Bilder umwandeln und die Textsuche verhindern.","Stelle Breite und Höhe ein und exportiere in unterstützten Modi als JPEG, PNG oder HEIC.","Technische Vorgaben für ausgewählte internationale Pässe und Visa. Die behördliche Anerkennung wird nicht garantiert."],privacy:"Fotos und PDF-Inhalte werden lokal auf dem iPhone verarbeitet. Internetzugriff kann für Werbung verwendet werden, nicht zum Hochladen der Dateien.",faq:[["Kann ich ein Foto auf 100 KB reduzieren?","Du kannst 100 KB als Limit einstellen. Das erzielbare Ergebnis hängt vom Ausgangsbild ab."],["Werden PDFs ins Internet hochgeladen?","Nein. Die PDF-Verarbeitung erfolgt lokal auf dem Gerät."],["Garantiert die App die Anerkennung von Passfotos?","Nein. Entscheidend sind die amtlichen Regeln."]],alt:"Echter iPhone-Bildschirm mit Fotogröße vor und nach der Komprimierung",more:"PDF-Komprimierung"},
fr:{lang:"fr",title:"Compresser Photo et PDF en Ko / Mo sur iPhone | Arvectum",meta:"Appli iPhone gratuite pour compresser photos et PDF à 100 Ko ou 1 Mo, redimensionner des images en pixels et traiter les fichiers sur l'appareil.",heading:"Compressez vos photos et PDF à la taille demandée",lead:"Un formulaire exige 100 Ko, 500 Ko ou 1 Mo maximum ? Préparez vos photos et PDF directement sur votre iPhone.",cta:"Télécharger gratuitement sur iPhone",h2:["Réduire les photos à 100 Ko, 500 Ko ou 1 Mo","Compresser les PDF pour un envoi","Modifier les dimensions en pixels","Préparer les photos pour les documents"],body:["Choisissez une limite en Ko ou Mo et vérifiez le poids réel avant d'enregistrer le fichier.","Les PDF sont traités sur l'appareil. Une forte compression peut transformer les pages en images et désactiver la recherche de texte.","Réglez la largeur et la hauteur et exportez en JPEG, PNG ou HEIC dans les modes compatibles.","Des préréglages techniques existent pour certains passeports et visas internationaux, sans garantie d'acceptation."],privacy:"Le contenu des photos et PDF est traité localement sur iPhone. Internet peut servir à la publicité, pas au traitement des fichiers.",faq:[["Puis-je compresser une photo à 100 Ko ?","Vous pouvez définir 100 Ko comme limite ; le résultat dépend du fichier d'origine."],["Les PDF passent-ils par un serveur ?","Non. Le traitement des PDF s'effectue sur l'iPhone."],["L'acceptation des photos d'identité est-elle garantie ?","Non. Vérifiez les règles des autorités concernées."]],alt:"Capture réelle iPhone comparant la photo avant et après compression",more:"Compresser un PDF"}
};
const urls={ru:"/tools/photo-size/index.html",...Object.fromEntries(Object.keys(markets).map(k=>[k,`/tools/photo-size/${k}/index.html`]))};
function esc(s){return String(s).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function langs(){return Object.entries(urls).map(([l,u])=>`<link rel="alternate" hreflang="${l==="ru"?"ru-RU":l==="pt-br"?"pt-BR":l}" href="${domain+u}" />`).join("\n    ")+`\n    <link rel="alternate" hreflang="x-default" href="${domain+urls.en}" />`;}
function nav(active){return Object.entries(urls).map(([l,u])=>`<a href="${u}" hreflang="${l}" ${l===active?'aria-current="page"':''}>${l==="pt-br"?"PT-BR":l.toUpperCase()}</a>`).join(" · ");}
for(const [key,t] of Object.entries(markets)){
 const canonical=domain+urls[key];
 const schema={"@context":"https://schema.org","@type":"SoftwareApplication","name":"Photo & PDF Size by Arvectum","applicationCategory":"UtilitiesApplication","operatingSystem":"iOS","url":canonical,"downloadUrl":app,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"publisher":{"@type":"Organization","name":"Arvectum","url":domain+"/"}};
 const faq={"@context":"https://schema.org","@type":"FAQPage","mainEntity":t.faq.map(([q,a])=>({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}))};
 const faqs=t.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n");
 const sections=t.h2.map((x,i)=>`<section class="info-card"><h2>${esc(x)}</h2><p>${esc(t.body[i])}</p></section>`).join("\n");
 const html=`<!doctype html>
<html lang="${t.lang}">
<head>
 <meta charset="utf-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1" />
 <title>${esc(t.title)}</title>
 <meta name="description" content="${esc(t.meta)}" />
 <meta name="robots" content="index,follow" />
 <link rel="canonical" href="${canonical}" />
 ${langs()}
 <meta property="og:type" content="website" />
 <meta property="og:title" content="${esc(t.title)}" />
 <meta property="og:description" content="${esc(t.meta)}" />
 <meta property="og:url" content="${canonical}" />
 <meta property="og:image" content="${domain}/assets/apps/photo-size/${key}-compress.jpg" />
 <link rel="shortcut icon" href="/favicon.ico" />
 <link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg?v=20260616-seo24" />
 <link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32x32.png?v=20260616-seo24" />
 <link rel="icon" type="image/png" sizes="16x16" href="/assets/brand/favicon-16x16.png?v=20260616-seo24" />
 <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png?v=20260616-seo24" />
 <link rel="stylesheet" href="/styles.css?v=20260712-cloudpub-test1" />
 <style>
 .app-landing{max-width:1100px;margin:auto;padding:3rem 1.25rem}
 .app-hero{display:grid;grid-template-columns:1fr minmax(220px,320px);align-items:center;gap:3rem}
 .app-hero img{width:100%;border-radius:20px;box-shadow:0 18px 50px #061a2045}
 .app-eyebrow{font-weight:700;letter-spacing:.08em;color:#00a995}
 .app-cta{display:inline-block;background:#12bfa7;color:#072b31;padding:1rem 1.25rem;text-decoration:none;font-weight:700;border-radius:12px;margin:1rem 0}
 .app-sections{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem;margin:3rem 0}
 .app-sections .info-card{padding:1.4rem}
 .app-faq details{margin:1rem 0;padding:1rem;border:1px solid #adbed0;border-radius:10px}
 .app-languages{margin:2rem 0}
 @media(max-width:700px){.app-hero,.app-sections{grid-template-columns:1fr}.app-hero img{width:min(72%,300px);margin:auto}}
 </style>
 <script type="application/ld+json">${JSON.stringify(schema)}</script>
 <script type="application/ld+json">${JSON.stringify(faq)}</script>
</head>
<body>
 <header class="site-header"><div class="container"><div class="header-shell glass"><div class="topbar"><a class="brand" href="/"><img src="/assets/brand/arvectum-logo-header-light.svg" alt="Arvectum" /></a><nav class="desktop-nav" aria-label="Navigation"><a class="nav-link" href="/tools/index.html">Arvectum Tools</a></nav></div></div></div></header>
 <main class="app-landing">
  <p class="app-eyebrow">ARVECTUM TOOLS · iPhone</p>
  <div class="app-hero"><div><h1>${esc(t.heading)}</h1><p>${esc(t.lead)}</p><p><a class="app-cta" href="${app}" rel="noopener noreferrer">${esc(t.cta)} ↗</a></p><p>${esc(t.privacy)}</p></div><img src="/assets/apps/photo-size/${key}-compress.jpg" alt="${esc(t.alt)}" width="280" height="608" fetchpriority="high" /></div>
  <div class="app-sections">${sections}</div>
  <section class="app-faq"><h2>FAQ</h2>${faqs}${key==="en"?'<p><a href="/tools/photo-size/en/compress-pdf.html">Compress PDF to 1 MB or 500 KB →</a></p>':""}</section>
  <nav class="app-languages" aria-label="Languages">${nav(key)}</nav>
  <p><a href="${app}" rel="noopener noreferrer">${esc(t.cta)} ↗</a></p>
 </main>
 <footer class="site-footer"><div class="container"><p>© 2026 Arvectum · <a href="/tools/index.html">Tools</a> · <a href="/privacy">Privacy</a></p></div></footer>
</body>
</html>\n`;
 const dir=path.join(base,key);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),html);
}
console.log("Generated",Object.keys(markets).length,"localized draft SEO landing pages. NO DEPLOY.");
