import { Plugin } from 'vite';
import * as babel from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

const isCapitalized = (str: string) => str[0] === str[0].toUpperCase();

export function removeNonDefaultExportsFromRoutes(): Plugin {
  return {
    name: 'remove-unused-imports',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.route.tsx')) return;

      const babelResult = await babel.transformAsync(code, {
        filename: id,
        presets: [['@babel/preset-typescript', { allExtensions: true, isTSX: true }]],
        plugins: [
          {
            visitor: {
              Program(path: NodePath<t.Program>) {
                const importsToKeep = new Set<string>();
                let defaultExportName: string | null = null;

                // Function to collect dependencies
                const collectDependencies = (path: NodePath) => {
                  path.traverse({
                    Identifier(identifierPath: NodePath<t.Identifier>) {
                      importsToKeep.add(identifierPath.node.name);
                    },
                    TSTypeReference(typeReferencePath: NodePath<t.TSTypeReference>) {
                      if (t.isIdentifier(typeReferencePath.node.typeName)) {
                        importsToKeep.add(typeReferencePath.node.typeName.name);
                      }
                    },
                    JSXOpeningElement(jsxOpeningElementPath) {
                      const openingElementName = jsxOpeningElementPath.get('name');

                      if (
                        t.isJSXIdentifier(openingElementName.node) &&
                        isCapitalized(openingElementName.node.name)
                      ) {
                        // Direct component usage (e.g., <Component />)
                        importsToKeep.add(openingElementName.node.name);
                      } else if (t.isJSXMemberExpression(openingElementName.node)) {
                        // Member expression usage (e.g., <Component.SubComponent />)
                        let objectName = (openingElementName.node.object as any).name;
                        // Only need to add the base object of the member expression to importsToKeep
                        if (isCapitalized(objectName)) {
                          importsToKeep.add(objectName);
                        }
                      }
                    },
                  });
                };

                // Identify the default export and collect its dependencies
                path.traverse({
                  ExportDefaultDeclaration(exportPath: NodePath<t.ExportDefaultDeclaration>) {
                    const declaration = exportPath.node.declaration;
                    if (t.isIdentifier(declaration)) {
                      defaultExportName = declaration.name;
                    } else if (
                      t.isFunctionDeclaration(declaration) ||
                      t.isClassDeclaration(declaration)
                    ) {
                      if (declaration.id) {
                        defaultExportName = declaration.id.name;
                        collectDependencies(exportPath);
                      }
                    } else if (t.isVariableDeclaration(declaration)) {
                      (declaration as any).declarations.forEach((declarator: any) => {
                        if (t.isIdentifier(declarator.id)) {
                          defaultExportName = declarator.id.name;
                          collectDependencies(exportPath);
                        }
                      });
                    }
                  },
                });

                // Remove all exports except the default export
                path.traverse({
                  ExportNamedDeclaration(namedExportPath: NodePath<t.ExportNamedDeclaration>) {
                    namedExportPath.remove();
                  },
                  ExportAllDeclaration(allExportPath: NodePath<t.ExportAllDeclaration>) {
                    allExportPath.remove();
                  },
                });

                // Remove unused imports based on collected dependencies
                path.traverse({
                  ImportDeclaration(importPath: NodePath<t.ImportDeclaration>) {
                    importPath.node.specifiers = importPath.node.specifiers.filter(
                      (specifier) =>
                        importsToKeep.has(specifier.local.name) ||
                        (specifier.type === 'ImportSpecifier' && specifier.importKind === 'type'),
                    );

                    if (importPath.node.specifiers.length === 0) {
                      importPath.remove();
                    }
                  },
                });
              },
            },
          },
        ],
      });

      if (babelResult?.code) {
        // console.log(babelResult.code);
        return {
          code: babelResult.code,
          map: babelResult.map,
        };
      }
    },
  };
}
