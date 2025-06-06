'use client';

import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

// Tipos de checklist disponíveis
const tiposChecklist = [
  "Compras",
  "Viagem",
  "Doméstico",
  "Trabalho",
  "Livre"
] as const;

type TipoChecklist = typeof tiposChecklist[number];

const categoriasPadrao: Record<TipoChecklist, string[]> = {
  Compras: [
    "Bruto",
    "Padaria",
    "Carnes",
    "Produto de Limpeza",
    "Hortifrut",
    "Utilidades"
  ],
  Viagem: [
    "Documentos",
    "Roupas",
    "Higiene",
    "Eletrônicos",
    "Saúde",
    "Outros"
  ],
  Doméstico: [
    "Limpeza",
    "Organização",
    "Manutenção",
    "Cozinha",
    "Lavanderia"
  ],
  Trabalho: [
    "Prioridades",
    "Reuniões",
    "Entregas",
    "Pendências"
  ],
  Livre: [
    "Tarefas"
  ]
};

type Item = {
  text: string;
  checked: boolean;
};

type ItemsPorCategoria = {
  [categoria: string]: Item[];
};

type ChecklistData = {
  categorias: string[];
  items: ItemsPorCategoria;
};

type Checklists = {
  [tipo in TipoChecklist]: ChecklistData;
};

function getEmptyItems(categorias: string[]): ItemsPorCategoria {
  const obj: ItemsPorCategoria = {};
  categorias.forEach(cat => {
    obj[cat] = [];
  });
  return obj;
}

function getEmptyNewItems(categorias: string[]): { [categoria: string]: string } {
  const obj: { [categoria: string]: string } = {};
  categorias.forEach(cat => {
    obj[cat] = "";
  });
  return obj;
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // Tipo de checklist selecionado (carrega do localStorage se existir)
  const [tipoAtual, setTipoAtual] = useState<TipoChecklist>(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("tipoChecklistAtual");
      if (salvo && tiposChecklist.includes(salvo as TipoChecklist)) {
        return salvo as TipoChecklist;
      }
    }
    return "Compras";
  });

  // Estado principal de todos os checklists
  const [checklists, setChecklists] = useState<Checklists>(() => {
    const initial: Partial<Checklists> = {};
    tiposChecklist.forEach(tipo => {
      initial[tipo] = {
        categorias: [...categoriasPadrao[tipo]],
        items: getEmptyItems(categoriasPadrao[tipo])
      };
    });
    return initial as Checklists;
  });

  // Estado para inputs de novos itens por categoria
  const [newItems, setNewItems] = useState<{ [categoria: string]: string }>(() =>
    getEmptyNewItems(categoriasPadrao["Compras"])
  );

  // Edição de item
  const [editing, setEditing] = useState<{ categoria: string | null; index: number | null }>({ categoria: null, index: null });
  const [editingText, setEditingText] = useState("");

  // Edição de categoria
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null);
  const [novoNomeCategoria, setNovoNomeCategoria] = useState<string>("");

  // Modo de edição
  const [modoEdicao, setModoEdicao] = useState(false);

  // Carregar do localStorage só no client
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("multi-checklists");
    if (saved) {
      setChecklists(JSON.parse(saved));
    }
    // Ativa modo edição se não houver nenhum item no checklist atual
    const nenhumItem = Object.values(checklists[tipoAtual]?.items || {}).every(lista => lista.length === 0);
    setModoEdicao(nenhumItem);
    // Atualiza os campos de novo item para as categorias do tipo atual
    setNewItems(getEmptyNewItems(checklists[tipoAtual]?.categorias || categoriasPadrao[tipoAtual]));
    // eslint-disable-next-line
  }, []);

  // Persistência no localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("multi-checklists", JSON.stringify(checklists));
    }
  }, [checklists, isClient]);

  // Atualiza os campos de novo item ao trocar de tipo
  useEffect(() => {
    setNewItems(getEmptyNewItems(checklists[tipoAtual]?.categorias || categoriasPadrao[tipoAtual]));
  }, [tipoAtual, checklists]);

  // Salva o tipo de checklist atual no localStorage sempre que mudar
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("tipoChecklistAtual", tipoAtual);
    }
  }, [tipoAtual, isClient]);

  // Adicionar item em uma categoria
  const addItem = (categoria: string) => {
    const text = newItems[categoria]?.trim();
    if (text) {
      setChecklists(prev => ({
        ...prev,
        [tipoAtual]: {
          ...prev[tipoAtual],
          items: {
            ...prev[tipoAtual].items,
            [categoria]: [...prev[tipoAtual].items[categoria], { text, checked: false }]
          }
        }
      }));
      setNewItems({ ...newItems, [categoria]: "" });
    }
  };

  // Remover item
  const removeItem = (categoria: string, index: number) => {
    const confirm = window.confirm("Tem certeza que deseja remover este item?");
    if (!confirm) return;
    setChecklists(prev => ({
      ...prev,
      [tipoAtual]: {
        ...prev[tipoAtual],
        items: {
          ...prev[tipoAtual].items,
          [categoria]: prev[tipoAtual].items[categoria].filter((_, i) => i !== index)
        }
      }
    }));
  };

  // Marcar/desmarcar item
  const toggleCheck = (categoria: string, index: number) => {
    setChecklists(prev => ({
      ...prev,
      [tipoAtual]: {
        ...prev[tipoAtual],
        items: {
          ...prev[tipoAtual].items,
          [categoria]: prev[tipoAtual].items[categoria].map((item, i) =>
            i === index ? { ...item, checked: !item.checked } : item
          )
        }
      }
    }));
  };

  // Iniciar edição de item
  const startEdit = (categoria: string, index: number) => {
    setEditing({ categoria, index });
    setEditingText(checklists[tipoAtual].items[categoria][index].text);
  };

  // Salvar edição de item
  const saveEdit = () => {
    const { categoria, index } = editing;
    if (categoria !== null && index !== null) {
      setChecklists(prev => ({
        ...prev,
        [tipoAtual]: {
          ...prev[tipoAtual],
          items: {
            ...prev[tipoAtual].items,
            [categoria]: prev[tipoAtual].items[categoria].map((item, i) =>
              i === index ? { ...item, text: editingText } : item
            )
          }
        }
      }));
    }
    setEditing({ categoria: null, index: null });
    setEditingText("");
  };

  // Salvar edição de categoria
  const salvarNomeCategoria = (categoriaAntiga: string) => {
    const novoNome = novoNomeCategoria.trim();
    if (
      novoNome &&
      novoNome !== categoriaAntiga &&
      !checklists[tipoAtual].categorias.includes(novoNome)
    ) {
      // Atualiza lista de categorias
      const novasCategorias = checklists[tipoAtual].categorias.map(cat =>
        cat === categoriaAntiga ? novoNome : cat
      );
      // Atualiza os itens e os novos itens
      const novosItems: ItemsPorCategoria = {};
      const novosNewItems: { [categoria: string]: string } = {};
      novasCategorias.forEach(cat => {
        if (cat === novoNome) {
          novosItems[cat] = checklists[tipoAtual].items[categoriaAntiga] || [];
          novosNewItems[cat] = newItems[categoriaAntiga] || "";
        } else {
          novosItems[cat] = checklists[tipoAtual].items[cat] || [];
          novosNewItems[cat] = newItems[cat] || "";
        }
      });
      setChecklists(prev => ({
        ...prev,
        [tipoAtual]: {
          ...prev[tipoAtual],
          categorias: novasCategorias,
          items: novosItems
        }
      }));
      setNewItems(novosNewItems);
    }
    setCategoriaEditando(null);
    setNovoNomeCategoria("");
  };

  // Adicionar nova categoria
  const [novaCategoria, setNovaCategoria] = useState("");
  const adicionarCategoria = () => {
    const nome = novaCategoria.trim();
    if (
      nome &&
      !checklists[tipoAtual].categorias.includes(nome)
    ) {
      setChecklists(prev => ({
        ...prev,
        [tipoAtual]: {
          ...prev[tipoAtual],
          categorias: [...prev[tipoAtual].categorias, nome],
          items: { ...prev[tipoAtual].items, [nome]: [] }
        }
      }));
      setNewItems({ ...newItems, [nome]: "" });
      setNovaCategoria("");
    }
  };

  // Só renderiza após montar no client
  if (!isClient) return null;

  const categorias = checklists[tipoAtual].categorias;
  const items = checklists[tipoAtual].items;

  return (
    <div className="container">
      <div style={{ marginBottom: 12, textAlign: "center" }}>
  <label style={{ fontWeight: 500, marginRight: 8 }}>Tipo de Checklist:</label>
  <select
    value={tipoAtual}
    onChange={e => setTipoAtual(e.target.value as TipoChecklist)}
    style={{
      fontSize: "1em",
      padding: "6px 16px",
      borderRadius: 8,
      border: "1px solid #2d7a2d",
      background: "#f8fff8",
      color: "#2d7a2d",
      fontWeight: 600,
      outline: "none",
      boxShadow: "0 1px 4px #0001",
      cursor: "pointer",
      transition: "border 0.2s"
    }}
    onFocus={e => (e.currentTarget.style.border = "1.5px solid #1e4d1e")}
    onBlur={e => (e.currentTarget.style.border = "1px solid #2d7a2d")}
  >
    {tiposChecklist.map(tipo => (
      <option key={tipo} value={tipo}>{tipo}</option>
    ))}
  </select>
</div>

      {/* <h1 style={{
        textAlign: "center",
        marginTop: 8,
        marginBottom: 8,
        fontFamily: "inherit",
        fontWeight: 700,
        fontSize: "1.2em",
        letterSpacing: "1px",
      }}>
        {`Checklist de ${tipoAtual}`}
      </h1> */}

      <div style={{ textAlign: "right", marginBottom: 2 }}>
        <label style={{ cursor: "pointer", fontWeight: 500, fontSize: "0.8em" }}>
          <input
            type="checkbox"
            checked={modoEdicao}
            onChange={e => setModoEdicao(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Modo de Edição
        </label>
      </div>

      {modoEdicao && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
          <input
            className="input"
            style={{ flex: 1 }}
            type="text"
            placeholder="Nova categoria"
            value={novaCategoria}
            onChange={e => setNovaCategoria(e.target.value)}
            onKeyDown={e => e.key === "Enter" && adicionarCategoria()}
          />
          <button className="botao-adicionar" onClick={adicionarCategoria}>
            <FaPlus /> Categoria
          </button>
        </div>
      )}

      <div style={{ maxWidth: 500, margin: "2px auto", fontFamily: "sans-serif" }}>
        {categorias.map((categoria) => (
          <div key={categoria} style={{ marginBottom: 4 }}>
            {categoriaEditando === categoria && modoEdicao ? (
              <input
                className="input"
                style={{ fontWeight: "bold", fontSize: "1em", marginBottom: 8, marginTop: 8 }}
                value={novoNomeCategoria}
                autoFocus
                onChange={e => setNovoNomeCategoria(e.target.value)}
                onBlur={() => salvarNomeCategoria(categoria)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    salvarNomeCategoria(categoria);
                  }
                }}
              />
            ) : (
              <h2
                className="categoria-titulo"
                style={{ marginBottom: 8, display: "flex", alignItems: "center" }}
              >
                {categoria}
                {modoEdicao && (
                  <button
                    style={{ marginLeft: 8, fontSize: 14, padding: "2px 8px" }}
                    onClick={e => {
                      e.stopPropagation();
                      setCategoriaEditando(categoria);
                      setNovoNomeCategoria(categoria);
                    }}
                    title="Editar nome da categoria"
                  >
                    <FaEdit />
                  </button>
                )}
              </h2>
            )}
            {modoEdicao && (
              <div className="adicionar-container" style={{ display: "flex", gap: 8, marginBottom: 0 }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  type="text"
                  placeholder={` Novo item em ${categoria}`}
                  value={newItems[categoria] || ""}
                  onChange={e =>
                    setNewItems({ ...newItems, [categoria]: e.target.value })
                  }
                  onKeyDown={e => e.key === "Enter" && addItem(categoria)}
                />
                <button
                  className="botao-adicionar"
                  onClick={() => addItem(categoria)}
                >
                  <FaPlus /> Item
                </button>
              </div>
            )}
            <ul className="lista-compras-lista">
              {items[categoria]?.map((item, index) => (
                <li
                  key={index}
                  className={`lista-compras-item${item.checked ? " checked" : ""}`}
                >
                  {editing.categoria === categoria && editing.index === index && modoEdicao ? (
                    <input
                      className="input"
                      style={{ flex: 1 }}
                      value={editingText}
                      autoFocus
                      onChange={e => setEditingText(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit();
                      }}
                    />
                  ) : (
                    <span
                      style={{ flex: 1, cursor: "pointer", margin: 8 }}
                      onClick={() => toggleCheck(categoria, index)}
                    >
                      {item.text}
                    </span>
                  )}
                  {modoEdicao && (
                    <>
                      <button
                        className="botao-editar"
                        onClick={e => {
                          e.stopPropagation();
                          startEdit(categoria, index);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="botao-remover"
                        onClick={e => {
                          e.stopPropagation();
                          removeItem(categoria, index);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}