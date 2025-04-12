// src/components/ConnectCabinetForm.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { UserAuth } from "@/context/auth-context";
import { connectContainerToUser } from "@/services/firestore-services"; // You'll need to create this function

function ConnectCabinetForm({ onSuccess }) {
  const [containerId, setContainerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { userProfile } = UserAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!containerId.trim()) {
      setError("Please enter a Cabinet ID.");
      return;
    }

    setIsLoading(true);

    try {
      // Connect the container to the user
      await connectContainerToUser(userProfile.id, containerId.trim());

      // Set success message
      setSuccess(
        "Cabinet connected successfully! Your dashboard will now show this cabinet's data."
      );

      // Clear input field
      setContainerId("");

      // Call the onSuccess callback
      if (onSuccess) {
        onSuccess(containerId.trim());
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError(
        err.message ||
          "Could not connect to this cabinet. Please check the ID and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Success message */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input field */}
          <div className="space-y-2">
            <Label htmlFor="cabinetId">Cabinet ID</Label>
            <Input
              id="cabinetId"
              placeholder="e.g., container_04"
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              disabled={isLoading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Find this ID printed on the label attached to your cabinet.
            </p>
          </div>

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Cabinet"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ConnectCabinetForm;
