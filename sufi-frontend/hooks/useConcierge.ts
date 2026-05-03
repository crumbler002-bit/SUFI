import { useMutation } from "@tanstack/react-query";
import { conciergeApi, type ConciergeResponse } from "@/lib/api";

export function useConcierge() {
  return useMutation<ConciergeResponse, Error, string>({
    mutationFn: (query: string) => {
      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("sufi_session")
          : null;
      return conciergeApi.chat(query, sessionId).then((res) => {
        if (res.session_id && typeof window !== "undefined") {
          localStorage.setItem("sufi_session", res.session_id);
        }
        return res;
      });
    },
  });
}
