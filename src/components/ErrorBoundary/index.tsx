import * as React from "react";

export class ErrorBoundary extends React.Component {
  componentDidCatch(error: any, errorInfo: any) {
    console.log('componentDidCatch:', error, errorInfo);
    window.postMessage({
      type: 'componentDidCatch',
      data: { error, errorInfo }
    }, '*');
  }

  render(): React.ReactNode {
    return (
      <React.Fragment>
        {/* @ts-ignore */}
        {this.props.children}
      </React.Fragment>
    );
  }
}
