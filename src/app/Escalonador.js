'use client';
import React, { useState } from 'react';
import './Escalonador.css';

const Escalonador = () => {
  const [processos, setProcessos] = useState([]);
  const [quantum, setQuantum] = useState(2);
  const [tempoAtual, setTempoAtual] = useState(0);
  const [emExecucao, setEmExecucao] = useState(false);
  const [ganttChart, setGanttChart] = useState([]);
  const [processosIniciais, setProcessosIniciais] = useState([]);

  const limparGrafico = () => {
    setGanttChart([]);
    setTempoAtual(0);
  };

  const criarProcessosAleatorios = () => {
    limparGrafico();
    const numProcessos = Math.floor(Math.random() * 6) + 3; // Entre 3 e 8 processos
    const novosProcessos = Array.from({ length: numProcessos }, (_, index) => ({
      id: index + 1,
      tempoExecucao: Math.floor(Math.random() * 10) + 1, // Entre 1 e 10
      tempoRestante: 0, // Inicializado a zero, será ajustado depois
      tempoChegada: Math.floor(Math.random() * 10) + 1, // Entre 1 e 10
      finalizado: false
    }));

    // Inicializa tempoRestante com o valor de tempoExecução
    const processosComTempoRestante = novosProcessos.map(p => ({
      ...p,
      tempoRestante: p.tempoExecucao
    }));

    setProcessos(processosComTempoRestante);
    setProcessosIniciais(processosComTempoRestante); // Salva o estado inicial
  };

  const iniciarEscalonamentoCircular = () => {
    if (processos.length === 0) return;
    limparGrafico();
    setEmExecucao(true);

    const fila = processosIniciais.map(p => ({ ...p })); // Cópia dos processos
    let tempoCorrente = 0;

    const intervalo = setInterval(() => {
      const processosDisponiveis = fila.filter(p => p.tempoChegada <= tempoCorrente && p.tempoRestante > 0);

      if (processosDisponiveis.length === 0) {
        if (fila.every(p => p.finalizado)) {
          clearInterval(intervalo);
          setEmExecucao(false);
          return;
        }
        tempoCorrente++;
        return;
      }

      let processo = processosDisponiveis.shift();
      const tempoExecutado = Math.min(processo.tempoRestante, quantum);

      processo.tempoRestante -= tempoExecutado;
      tempoCorrente += tempoExecutado;

      if (processo.tempoRestante === 0) {
        processo.finalizado = true;
      } else {
        fila.push(processo);
      }

      setGanttChart(prev => [
        ...prev,
        { processoId: processo.id, tempoInicio: tempoCorrente - tempoExecutado, tempoFim: tempoCorrente }
      ]);

      setTempoAtual(tempoCorrente);
      setProcessos(prev => prev.map(p => (p.id === processo.id ? processo : p)));
    }, 1000);
  };

  const iniciarEscalonamentoSJF = () => {
    if (processos.length === 0) return;
    limparGrafico();
    setEmExecucao(true);

    const fila = processosIniciais.map(p => ({ ...p })); // Cópia dos processos
    let tempoCorrente = 0;

    const intervalo = setInterval(() => {
      const processosDisponiveis = fila
        .filter(p => p.tempoChegada <= tempoCorrente && p.tempoRestante > 0)
        .sort((a, b) => a.tempoRestante - b.tempoRestante);

      if (processosDisponiveis.length === 0) {
        if (fila.every(p => p.finalizado)) {
          clearInterval(intervalo);
          setEmExecucao(false);
          return;
        }
        tempoCorrente++;
        return;
      }

      let processo = processosDisponiveis.shift();
      tempoCorrente += processo.tempoRestante;

      processo.tempoRestante = 0;
      processo.finalizado = true;

      setGanttChart(prev => [
        ...prev,
        { processoId: processo.id, tempoInicio: tempoCorrente - processo.tempoExecucao, tempoFim: tempoCorrente }
      ]);

      setTempoAtual(tempoCorrente);
      setProcessos(prev => prev.map(p => (p.id === processo.id ? processo : p)));
    }, 1000);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Simulador de Escalonamento de Processos</h2>
        <button onClick={criarProcessosAleatorios} disabled={emExecucao}>
          Criar Processos Aleatórios
        </button>
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tempo de Execução</th>
              <th>Tempo Restante</th>
              <th>Tempo de Chegada</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {processos.map(processo => (
              <tr key={processo.id}>
                <td>{processo.id}</td>
                <td>{processo.tempoExecucao}</td>
                <td>{processo.tempoRestante}</td>
                <td>{processo.tempoChegada}</td>
                <td>{processo.finalizado ? 'Finalizado' : 'Em Execução'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Simulação de Escalonamento</h2>
        <p>Tempo Atual: {tempoAtual}s</p>

        <div>
          <h3>Round Robin (Quantum: {quantum})</h3>
          <button onClick={iniciarEscalonamentoCircular} disabled={emExecucao}>
            Executar Round Robin
          </button>
          <h3>SJF</h3>
          <button onClick={iniciarEscalonamentoSJF} disabled={emExecucao}>
            Executar SJF
          </button>
        </div>

        <h2>Gráfico de Gantt (Tempo x Processo)</h2>
        <div className="gantt-chart">
          {processos.map(processo => (
            <div key={processo.id} className="gantt-row">
              <span>Processo {processo.id}</span>
              <div className="gantt-bar-container">
                {ganttChart
                  .filter(entry => entry.processoId === processo.id)
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="gantt-bar"
                      style={{
                        left: `${entry.tempoInicio * 30}px`,
                        width: `${(entry.tempoFim - entry.tempoInicio) * 30}px`,
                        backgroundColor: `hsl(${(entry.processoId * 100) % 360}, 70%, 50%)`
                      }}
                    >
                      {entry.tempoInicio}-{entry.tempoFim}s
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Escalonador;
