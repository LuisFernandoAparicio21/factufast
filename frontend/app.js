// Reemplaza con la URL que entrega el SAM deploy (Outputs.ApiUrl)
const API_URL = "https://TU_API_ID.execute-api.us-east-1.amazonaws.com/Prod/facturas";

const form     = document.getElementById("factura-form");
const btnSubmit = document.getElementById("btn-submit");
const resultado = document.getElementById("resultado");
const errorBox  = document.getElementById("error-box");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultado.classList.add("hidden");
  errorBox.classList.add("hidden");
  btnSubmit.disabled = true;
  btnSubmit.textContent = "Generando...";

  const payload = {
    rfc:            form.rfc.value.trim().toUpperCase(),
    nombre:         form.nombre.value.trim(),
    codigo_postal:  form.codigo_postal.value.trim(),
    regimen_fiscal: form.regimen_fiscal.value,
  };

  try {
    const res  = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error desconocido");

    document.getElementById("folio").textContent    = data.folio_fiscal;
    document.getElementById("link-pdf").href        = data.pdf_url;
    document.getElementById("link-xml").href        = data.xml_url;
    resultado.classList.remove("hidden");
  } catch (err) {
    document.getElementById("error-msg").textContent = err.message;
    errorBox.classList.remove("hidden");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Generar Factura";
  }
});
