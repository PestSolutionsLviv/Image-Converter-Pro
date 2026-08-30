import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Readonly<Props>;
  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 antialiased">
          <div className="max-w-md w-full bg-slate-900/90 border border-white/20 rounded-[28px] p-6 shadow-2xl backdrop-blur-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h2 className="text-lg font-bold text-white tracking-tight">
              Виникла помилка під час завантаження
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Браузер або розширення обмежили доступ до пам’яті чи ресурсів. Натисніть нижче, щоб скинути кеш та оновити сторінку.
            </p>

            {this.state.error && (
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-left overflow-x-auto max-h-32">
                <code className="text-[11px] text-rose-300 font-mono break-all">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg border border-blue-300/40 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Оновити та скинути кеш
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
