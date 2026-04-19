"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { parseCsv, SAMPLE_CSV } from "@/lib/csv";
import { useStore } from "@/lib/store";

export function DataControls() {
  const { data, update } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFile(file: File) {
    const text = await file.text();
    const { results, errors: errs } = parseCsv(text);
    setErrors(errs.map((e) => `Row ${e.row}: ${e.message}`));
    if (results.length > 0) {
      update((prev) => ({ ...prev, results: [...prev.results, ...results] }));
      setMessage(`Loaded ${results.length} result${results.length === 1 ? "" : "s"}.`);
    } else {
      setMessage("No valid rows found.");
    }
  }

  function loadSample() {
    const { results } = parseCsv(SAMPLE_CSV);
    update((prev) => ({ ...prev, results }));
    setMessage(`Loaded ${results.length} sample results.`);
    setErrors([]);
  }

  function clearAll() {
    if (!confirm("Clear all results from this device?")) return;
    update((prev) => ({ ...prev, results: [] }));
    setMessage("Cleared.");
    setErrors([]);
  }

  return (
    <Card className="flex flex-col gap-3">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={() => fileRef.current?.click()}>Upload CSV</Button>
        <Button variant="secondary" onClick={loadSample}>
          Load sample
        </Button>
        {data.results.length > 0 && (
          <Button variant="ghost" onClick={clearAll}>
            Clear all
          </Button>
        )}
        <span className="text-xs text-muted ml-auto">
          {data.results.length} result{data.results.length === 1 ? "" : "s"}
        </span>
      </div>
      {message && <div className="text-xs text-muted">{message}</div>}
      {errors.length > 0 && (
        <details className="text-xs text-warning">
          <summary className="cursor-pointer">
            {errors.length} row{errors.length === 1 ? "" : "s"} skipped
          </summary>
          <ul className="mt-1 list-disc list-inside text-muted">
            {errors.slice(0, 20).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
            {errors.length > 20 && <li>…and {errors.length - 20} more</li>}
          </ul>
        </details>
      )}
      <details className="text-xs text-muted">
        <summary className="cursor-pointer">CSV format</summary>
        <pre className="mt-2 p-2 bg-card-border/40 rounded overflow-x-auto text-xs">
{`Athlete Name,School,Gender,Classification,Event,Time,Meet,Date
Ethan Parker,Lone Peak HS,M,6A,1600m,4:14.23,Region,2025-05-02`}
        </pre>
      </details>
    </Card>
  );
}
