import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    // logErrorToService(error, errorInfo);
    console.log("Caught error: ", error, errorInfo);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorComponent message={this.props.message} />;
    }
    return this.props.children;
  }
}

function ErrorComponent({ message }) {
  const { t } = useTranslation(undefined, { keyPrefix: "general" });
  const header = "Something went wrong!";
  // const header = t("error_handling.header");
  const displayMessage =
    message ??
    "Try refreshing your browser's cache (Ctrl + F5) or ask in #gb-report if the problem persists.";
  // const displayMessage = message ?? t("error_handling.default");
  return (
    <>
      <Typography variant="h6" color="error">
        Something went wrong!
      </Typography>
      <Typography variant="body1" color="error">
        {displayMessage}
      </Typography>
    </>
  );
}
