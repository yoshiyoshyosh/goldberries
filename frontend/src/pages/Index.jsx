import { useQuery } from "react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../hooks/AuthProvider";

export function PageIndex() {
  const auth = useAuth();

  const testQuery = useQuery({
    queryKey: "test",
    queryFn: () => axios.get("/campaign.php?id=1"),
  });

  const test = () => {
    toast.success("Hii");
  };

  return (
    <div>
      <h1>Index</h1>
      <button onClick={test}>Hii</button>
      <br />
      <p>User: {auth.user ? JSON.stringify(auth.user) : "null"}</p>
      <br />
      {testQuery.isLoading && <p>Loading...</p>}
      {testQuery.isError && <p>{testQuery.error.message}</p>}
      {testQuery.isSuccess && (
        <div style={{ width: "800px" }}>
          <pre>
            <code style={{ wordBreak: "break-word", display: "block", width: "800px" }}>
              {JSON.stringify(testQuery.data.data)}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
