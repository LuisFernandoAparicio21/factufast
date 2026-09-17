import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="py-20 px-4">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Algo salió mal</h2>
            <p className="text-sm text-gray-500 mb-5">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
