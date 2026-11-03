import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TimeLux caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 text-center text-[#f5f1e8]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-2xl text-[#d4af37]">
            ✦
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">TimeLux Storefront</h1>
          <p className="mt-2 text-xs text-gray-400 max-w-md">
            An unexpected error occurred while loading this view. You can reload the page or return to the collection.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-[#09090b] transition hover:bg-white"
            >
              Reload Page
            </button>
            <a
              href="/"
              className="rounded-xl border border-white/20 px-6 py-2.5 text-xs font-semibold text-gray-300 transition hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
