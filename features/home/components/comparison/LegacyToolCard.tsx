export default function LegacyToolCard() {
  return (
    <div className="border-border rounded-2xl border p-6 opacity-70">
      <p className="text-muted-foreground font-mono text-xs tracking-widest">
        これまでの調整ツール
      </p>
      <div className="border-border mt-4 overflow-hidden rounded-lg border">
        <table className="w-full text-center text-sm">
          <thead className="bg-muted text-muted-foreground text-xs">
            <tr>
              <th className="py-2 font-medium">日付</th>
              <th className="py-2 font-medium">Aさん</th>
              <th className="py-2 font-medium">Bさん</th>
              <th className="py-2 font-medium">Cさん</th>
            </tr>
          </thead>
          <tbody className="text-foreground/70">
            <tr className="border-border border-t">
              <td className="py-2 font-mono text-xs">7/3</td>
              <td>○</td>
              <td>△</td>
              <td>○</td>
            </tr>
            <tr className="border-border border-t">
              <td className="py-2 font-mono text-xs">7/4</td>
              <td>△</td>
              <td>○</td>
              <td>✕</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        日は決まっても、「で、何時から？」の調整がもう一往復発生する。
      </p>
    </div>
  );
}
