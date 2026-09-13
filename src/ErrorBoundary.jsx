import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('KKS website crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream text-ink font-body px-6 text-center">
          <div>
            <h1 className="font-display text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-ink/70 mb-6">Please reload the page. If the problem continues, contact secretarykksbbsr@gmail.com.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-backwater text-ivory px-6 py-3 rounded-full font-semibold hover:bg-backwater-light transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
