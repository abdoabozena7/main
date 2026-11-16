import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Maximize2, Minimize2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";

let commands: Promise<typeof import("./terminalCommands")> | undefined;
function loadCommands() {
  return commands ??= import("./terminalCommands").catch(error => {
    commands = undefined;
    throw error;
  });
}
const prefetchCommands = () => { void loadCommands().catch(() => {}); };

interface CommandOutput {
  id: number;
  type: "command" | "response" | "error";
  content: React.ReactNode;
}

const Terminal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandOutput[]>([{
    id: 0,
    type: "response",
    content: <div className="mb-2"><p>Welcome to Abdelrahman's Portfolio Terminal.</p><p>A scripted playground for the curious. Type <span className="text-green-400">help</span> for commands, or ask about my work.</p></div>,
  }]);
  const nextId = useRef(1);
  const historyRevision = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const navigationTarget = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) prefetchCommands();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (!isOpen) opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setIsOpen(previous => !previous);
      }
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const command = trimmed.toLowerCase();
    if (command === "clear") {
      historyRevision.current++;
      setHistory([]);
      return;
    }
    if (command === "exit") {
      setIsOpen(false);
      return;
    }
    const revision = historyRevision.current;
    const id = nextId.current;
    nextId.current += 2;
    const append = (response: React.ReactNode) => {
      if (revision !== historyRevision.current) return;
      setHistory(previous => [
        ...previous,
        { id, type: "command", content: `guest@portfolio:~$ ${cmd}` },
        { id: id + 1, type: "response", content: response },
      ]);
    };
    void loadCommands().then(
      ({ respondToCommand }) => append(respondToCommand(trimmed)),
      () => append(<span className="text-red-400">Terminal commands could not load. Try again.</span>),
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="terminal-launcher fixed bottom-6 right-6 z-40 group">
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Ctrl + K</div>
        <DialogTrigger asChild>
          <button
            type="button"
            onPointerEnter={prefetchCommands}
            onPointerDown={prefetchCommands}
            onFocus={prefetchCommands}
            onClick={event => { opener.current = event.currentTarget; }}
            className="p-3 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-colors duration-200"
            aria-label="Open Terminal"
          >
            <TerminalIcon className="w-5 h-5" aria-hidden="true" /><span className="terminal-launcher-label">One more thing: the terminal</span>
          </button>
        </DialogTrigger>
      </div>
      <DialogContent
        className={`terminal-dialog ${isMaximized ? "terminal-dialog--maximized" : ""}`}
        onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus(); }}
        onCloseAutoFocus={event => {
          event.preventDefault();
          const hash = navigationTarget.current;
          navigationTarget.current = null;
          if (hash) {
            requestAnimationFrame(() => {
              const target = document.getElementById(hash.slice(1));
              target?.scrollIntoView({ behavior: "instant", block: "start" });
              target?.focus({ preventScroll: true });
            });
          } else {
            opener.current?.focus({ preventScroll: true });
          }
        }}
      >
        <DialogTitle className="sr-only">Portfolio terminal</DialogTitle>
        <DialogDescription className="sr-only">A scripted portfolio playground. Type help for available commands, or exit to close.</DialogDescription>
        <div className="terminal-titlebar">
          <div className="flex items-center gap-2">
            <DialogClose asChild><button type="button" className="terminal-dot-control" aria-label="Close terminal"><span className="bg-red-400" /></button></DialogClose>
            <span className="w-3 h-3 rounded-full bg-yellow-400" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-green-400" aria-hidden="true" />
            <span className="terminal-window-title">guest@portfolio:~</span>
          </div>
          <button type="button" className="terminal-size-control" onClick={() => setIsMaximized(value => !value)} aria-label={isMaximized ? "Restore terminal size" : "Maximize terminal"} aria-pressed={isMaximized}>
            {isMaximized ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
          </button>
        </div>
        <div className="terminal-history" ref={scrollRef} role="log" aria-label="Terminal output" aria-live="polite" onClick={event => {
          const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
          if (anchor) {
            navigationTarget.current = anchor.hash;
            setIsOpen(false);
          }
        }}>
          {history.map(entry => <div key={entry.id} className="mb-2 break-words">{entry.content}</div>)}
        </div>
        <form onSubmit={handleSubmit} className="terminal-input-row">
          <label htmlFor="terminal-command" className="sr-only">Terminal command</label>
          <span className="text-green-400 shrink-0" aria-hidden="true">guest:~$</span>
          <input id="terminal-command" ref={inputRef} type="text" value={input} onChange={event => setInput(event.target.value)} className="flex-1 min-w-0 bg-transparent border-none outline-none text-white p-0" spellCheck={false} autoComplete="off" />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Terminal;
