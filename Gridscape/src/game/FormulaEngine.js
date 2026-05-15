import { parse } from 'mathjs';

export class FormulaEngine {
  static analyze(formulaStr) {
    try {
      const node = parse(formulaStr);
      
      // Extract unique variables
      const variables = new Set();
      node.traverse((n) => {
        if (n.isSymbolNode && ['x', 'y', 'z'].includes(n.name)) {
          variables.add(n.name);
        }
      });
      
      // Calculate max degree
      let maxDegree = 1; 
      node.traverse((n) => {
        if (n.isOperatorNode && n.op === '^') {
          if (n.args[1] && n.args[1].isConstantNode) {
            const degree = n.args[1].value;
            if (degree > maxDegree) {
              maxDegree = degree;
            }
          }
        }
      });
      
      // Constant formulas like '0' or '-9.8' are perfectly valid for Newtonian physics!
      return {
        valid: true,
        variables: Array.from(variables),
        degree: maxDegree,
        compiled: node.compile()
      };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }
}
