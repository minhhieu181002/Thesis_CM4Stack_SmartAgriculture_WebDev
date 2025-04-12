// src/components/ConnectCabinetForm.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"; // Assuming shadcn setup
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'; // Icons

/**
 * A form component for users to manually enter a Cabinet/Container ID
 * to connect it to their account.
 *
 * Props:
 * onSuccess: function(containerId) - Callback function executed when a cabinet
 * is successfully connected (backend confirms). Receives the connected ID.
 */
function ConnectCabinetForm({ onSuccess }) {
  // State for the input field
  const [containerId, setContainerId] = useState('');
  // State to track loading during submission
  const [isLoading, setIsLoading] = useState(false);
  // State for holding error messages
  const [error, setError] = useState(null);
  // State for holding success messages
  const [success, setSuccess] = useState(null);

  // --- SIMULATED BACKEND CALL ---
  // Replace this with your actual API call to your backend/Firebase Function
  const simulateBackendConnection = (id) => {
    return new Promise((resolve, reject) => {
      console.log(`Simulating connection for ID: ${id}`);
      // Simulate network delay
      setTimeout(() => {
        // Basic validation simulation
        if (!id || !id.startsWith('container_')) {
          reject(new Error('Invalid Cabinet ID format. It should start with "container_".'));
        } else if (id === 'container_99') {
           // Simulate an already claimed container
           reject(new Error(`Cabinet ID "${id}" is already registered to another user.`));
        } else if (id === 'container_01' || id === 'container_04') {
           // Simulate successful connection for specific IDs
           console.log(`Simulated success for ${id}`);
           resolve({ message: `Successfully connected to Cabinet ID: ${id}` });
        } else {
           // Simulate ID not found
           reject(new Error(`Cabinet ID "${id}" not found.`));
        }
      }, 1500); // 1.5 second delay
    });
  };
  // --- END OF SIMULATED BACKEND CALL ---

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default browser form submission
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    // Basic frontend validation
    if (!containerId.trim()) {
      setError('Please enter a Cabinet ID.');
      return;
    }

    setIsLoading(true); // Start loading state

    try {
      // --- Replace with your actual backend call ---
      const response = await simulateBackendConnection(containerId.trim());
      // --- End of replacement section ---

      // Handle successful connection
      setSuccess(response.message);
      setContainerId(''); // Clear the input field on success

      // Call the onSuccess prop passed from the parent component
      if (onSuccess) {
        onSuccess(containerId.trim()); // Notify parent about success
      }

    } catch (err) {
      // Handle errors from the backend call
      console.error("Connection error:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false); // Stop loading state regardless of outcome
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto"> {/* Added styling for centering/width */}
      <CardHeader>
        <CardTitle>Connect Your Cabinet</CardTitle>
        <CardDescription>
          Enter the ID found on your cabinet label to link it to your account and view its data.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Display Success Message */}
          {success && (
            <Alert variant="default"> {/* Changed variant for success */}
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Display Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Input Field */}
          <div className="space-y-2">
            <Label htmlFor="cabinetId">Cabinet ID</Label>
            <Input
              id="cabinetId"
              placeholder="e.g., container_04"
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              disabled={isLoading} // Disable input while loading
              required
            />
            <p className="text-sm text-muted-foreground">
              Find this ID printed on the label attached to your cabinet.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Cabinet'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ConnectCabinetForm;

