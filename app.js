const SCALE = {
  name: "Échelle COMFORT-B",
  desc: "Évaluation du confort et du niveau de sédation chez l’enfant sédaté (ventilé ou non). Calcul automatique du score.",
  items: [
    { id: "eveil", title: "Éveil", options: [
      { label: "Profondément endormi", points: 1 },
      { label: "Légèrement endormi", points: 2 },
      { label: "Somnolent", points: 3 },
      { label: "Éveillé et vigilant", points: 4 },
      { label: "Hyper attentif", points: 5 },
    ]},
    { id: "calme_agitation", title: "Calme ou agitation", options: [
      { label: "Calme", points: 1 },
      { label: "Légèrement anxieux", points: 2 },
      { label: "Anxieux", points: 3 },
      { label: "Très anxieux", points: 4 },
      { label: "Paniqué", points: 5 },
    ]},
    { id: "ventilation", title: "Ventilation", options: [
      { label: "Pas de ventilation spontanée, pas de toux", points: 1 },
      { label: "Ventilation spontanée avec peu ou pas de réaction au respirateur", points: 2 },
      { label: "Lutte contre le respirateur ou tousse occasionnellement", points: 3 },
      { label: "Lutte activement contre le respirateur ou tousse régulièrement", points: 4 },
      { label: "S’oppose au respirateur, tousse ou suffoque", points: 5 },
    ]},
    { id: "mouvements", title: "Mouvements", options: [
      { label: "Absence de mouvement", points: 1 },
      { label: "Mouvements légers, occasionnels", points: 2 },
      { label: "Mouvements légers, fréquents", points: 3 },
      { label: "Mouvements énergiques, uniquement aux extrémités", points: 4 },
      { label: "Mouvements énergiques incluant le torse et la tête", points: 5 },
    ]},
    { id: "tonus", title: "Tonus musculaire", options: [
      { label: "Muscles totalement décontractés, aucune tension musculaire", points: 1 },
      { label: "Tonus musculaire diminué", points: 2 },
      { label: "Tonus musculaire normal", points: 3 },
      { label: "Tonus musculaire augmenté avec flexion des doigts et des orteils", points: 4 },
      { label: "Rigidité musculaire extrême avec flexion des doigts et des orteils", points: 5 },
    ]},
    { id: "visage", title: "Tension du visage", options: [
      { label: "Muscles du visage totalement décontractés", points: 1 },
      { label: "Tonus des muscles du visage normal, aucune tension visible", points: 2 },
      { label: "Contracture évidente de quelques muscles du visage", points: 3 },
      { label: "Contracture évidente de l’ensemble des muscles du visage", points: 4 },
      { label: "Muscles du visage contracturés et grimaçants", points: 5 },
    ]},
  ],
  interpret(total) {
    if (total <= 10) return "Sédation profonde (risque de sur-sédation)";
    if (total <= 17) return "Sédation adéquate chez l’enfant sédaté";
    if (total <= 26) return "Inconfort ou sédation insuffisante";
    return "Agitation importante – réévaluer la sédation";
  },
};

const $ = (sel) => document.querySelector(sel);

function render() {
  $("#scaleName").textContent = SCALE.name;
  $("#scaleDesc").textContent = SCALE.desc;

  const form = $("#scaleForm");
  form.innerHTML = "";

  for (const item of SCALE.items) {
    const block = document.createElement("section");
    block.className = "item";
    block.innerHTML = `<h2>${item.title}</h2>`;

    const options = document.createElement("div");
    options.className = "options";

    item.options.forEach((opt, idx) => {
      const id = `${item.id}_${idx}`;
      const row = document.createElement("label");
      row.className = "option";
      row.innerHTML = `
        <input type="radio" name="${item.id}" id="${id}" value="${opt.points}">
        <div class="meta">
          <div>${opt.label}</div>
          <div class="pts">${opt.points} point(s)</div>
        </div>
      `;
      options.appendChild(row);
    });

    block.appendChild(options);
    form.appendChild(block);
  }

  form.addEventListener("change", updateScore);
  $("#resetBtn").addEventListener("click", resetAll);
  $("#copyBtn").addEventListener("click", copySummary);

  updateScore();
}

function getSelections() {
  return SCALE.items.map((item) => {
    const chosen = document.querySelector(`input[name="${item.id}"]:checked`);
    return { item, points: chosen ? Number(chosen.value) : 0 };
  });
}

function updateScore() {
  const total = getSelections().reduce((sum, s) => sum + s.points, 0);
  $("#totalScore").textContent = total;
  $("#scoreHint").textContent = SCALE.interpret(total);
}

function resetAll() {
  $("#scaleForm").reset();
  updateScore();
}

function buildSummary() {
  const selections = getSelections();
  const lines = [];
  let total = 0;
  for (const s of selections) {
    total += s.points;
    lines.push(`${s.item.title}: ${s.points} pt`);
  }
  lines.push(`Total: ${total}`);
  return lines.join("\n");
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(buildSummary());
    $("#copyBtn").textContent = "Copié ✓";
    setTimeout(() => ($("#copyBtn").textContent = "Copier le résumé"), 1200);
  } catch {
    alert("Copie impossible (droits navigateur).");
  }
}

render();
