function Process() {
  const steps = [
    { number: "01", title: "Understand", description: "Listen to your needs – budget, location, preferences." },
    { number: "02", title: "Curate", description: "Handpick properties from our exclusive network." },
    { number: "03", title: "Match", description: "Show you only the best 3-5 options." },
    { number: "04", title: "Assist", description: "Negotiate, legal check, paperwork support." },
  ];

  return (
    <section className="process">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">How it works</span>
          <h2 className="section-title">Clarity from first click to final deal</h2>
        </div>
        <div className="process-grid">
          {steps.map((step) => (
            <div key={step.number} className="process-step">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Process;