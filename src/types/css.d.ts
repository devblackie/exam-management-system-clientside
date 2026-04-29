// clientside/src/types/css.d.ts — NEW FILE (just create it, no content needed beyond this)
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
