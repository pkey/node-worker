import colors from "colors";
colors.enable()

export default {
  info: (input: string) => console.log(`${new Date().toISOString()}: 🚧 ${input}`.yellow),
  error: (input: string) => console.log(`${new Date().toISOString()}: ❌ ${input}`.red),
  debug: (input: string) => console.log(`${new Date().toISOString()}: 🦄 ${input}`.green)
};
