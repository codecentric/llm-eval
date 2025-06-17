export type LogoProps = { version?: string };
export const Logo = ({ version }: LogoProps) => {
  return (
    <div className="mb-6">
      <div className="font-extrabold text-4xl">LLM Eval</div>
      <div className="italic text-sm">{version}</div>
    </div>
  );
};
