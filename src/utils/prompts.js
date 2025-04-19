export const structuralCompositionSystemPrompt = `Prompt:

You will act as an AI specialized in merging and composing multiple JSON representations of causal loop diagrams (CLDs) and their underlying models, with a specific emphasis on practical applications in the domain of interpersonal relationships. I will provide you with an array of JSON documents, each representing a CLD that includes formal declarations (objects and morphisms), metadata, and rich-text cells. Your task is twofold:

Merging: Merge all input models into a single, cohesive model while preserving their structural and mathematical integrity. This includes retaining all metadata and rich-text cells.

Composition and Application Analysis: Analyze the composed model to offer actionable insights that help a practitioner address issues and understand dynamics in interpersonal relationships. In your analysis, discuss how the combined model can be applied to improve communication, resolve conflicts, or enhance relationship dynamics.

Please adhere to the following guidelines:

Structural Preservation: Retain all crucial structural information, metadata, and rich-text content from each input model. Every cell (rich-text, formal, or stem) must be preserved.

Conflict Resolution: When overlapping or similar objects (e.g., entities with similar or variant naming) are encountered, merge them using a weighted approach that respects all source contributions. Document any assumptions and decisions in an additional rich-text cell if necessary.

Applied Category Theory: Employ concepts from applied category theory—specifically functors and pushouts—to guide the merging process. Compute a functorial pushout over the common substructures of the input models.

Real-World Application in Interpersonal Relationships: In addition to merging, provide a detailed explanation—within a separate rich-text cell—of how the composed model can be applied to real-world scenarios in interpersonal relationships. Explain how the model can be used to analyze relationship dynamics, facilitate better communication, or resolve conflicts.

Language Consistency: Preserve the original language, naming conventions, and metadata from all parent models.

Output Format: Your final answer should be a valid JSON document formatted according to the provided schema, ensuring that all UUIDs conform to the standard UUID format. Just output the JSON, no mardown formatting. 

Provided Schema:


{
  "$ref": "#/definitions/ModelDocument",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Cell<ModelJudgment>": {
      "anyOf": [
        {
          "$ref": "#/definitions/RichTextCell"
        },
        {
          "$ref": "#/definitions/FormalCell%3CModelJudgment%3E"
        },
        {
          "$ref": "#/definitions/StemCell"
        }
      ],
      "description": "A cell in a notebook. Any notebook can contain rich text cells, and support for editing rich text is built into the notebook editor. In addition, notebooks can contain cells of custom type, which is typically formal in contrast to natural text."
    },
    "FormalCell<ModelJudgment>": {
      "additionalProperties": false,
      "description": "A cell containing custom data, usually a formal object.",
      "properties": {
        "content": {
          "$ref": "#/definitions/ModelJudgment"
        },
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "formal",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id",
        "content"
      ],
      "type": "object"
    },
    "ModelDecl": {
      "anyOf": [
        {
          "$ref": "#/definitions/ObjectDecl"
        },
        {
          "$ref": "#/definitions/MorphismDecl"
        }
      ],
      "description": "A declaration in the definition of a model."
    },
    "ModelDocument": {
      "additionalProperties": false,
      "description": "A document defining a model.",
      "properties": {
        "name": {
          "description": "Human-readable name of the document.",
          "type": "string"
        },
        "notebook": {
          "$ref": "#/definitions/Notebook%3CModelJudgment%3E",
          "description": "Content of the model, formal and informal."
        },
        "theory": {
          "description": "Identifier of double theory that the model is of.",
          "type": "string"
        },
        "type": {
          "const": "model",
          "description": "Type of the document, such as \"model\" or \"diagram\".",
          "type": "string"
        }
      },
      "required": [
        "name",
        "notebook",
        "theory",
        "type"
      ],
      "type": "object"
    },
    "ModelJudgment": {
      "$ref": "#/definitions/ModelDecl",
      "description": "A judgment in the definition of a model. TODO: Judgments should be declarations *or* morphism equations."
    },
    "Mor": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Uuid"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "type": "string"
            },
            "tag": {
              "const": "Composite",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "additionalProperties": false,
              "properties": {
                "cod": {
                  "$ref": "#/definitions/Mor"
                },
                "dom": {
                  "$ref": "#/definitions/Mor"
                },
                "post": {
                  "$ref": "#/definitions/Mor"
                },
                "pre": {
                  "$ref": "#/definitions/Mor"
                }
              },
              "required": [
                "dom",
                "cod",
                "pre",
                "post"
              ],
              "type": "object"
            },
            "tag": {
              "const": "TabulatorSquare",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "A morphism in a model of a double theory."
    },
    "MorType": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Ustr"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/ObType"
            },
            "tag": {
              "const": "Hom",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "Morphism type in a double theory."
    },
    "MorphismDecl": {
      "additionalProperties": false,
      "description": "Declaration of a morphism in a model.",
      "properties": {
        "cod": {
          "anyOf": [
            {
              "$ref": "#/definitions/Ob"
            },
            {
              "type": "null"
            }
          ],
          "description": "Codomain of morphism, if defined."
        },
        "dom": {
          "anyOf": [
            {
              "$ref": "#/definitions/Ob"
            },
            {
              "type": "null"
            }
          ],
          "description": "Domain of morphism, if defined."
        },
        "id": {
          "$ref": "#/definitions/Uuid",
          "description": "Globally unique identifier of morphism."
        },
        "morType": {
          "$ref": "#/definitions/MorType",
          "description": "The morphism's type in the double theory."
        },
        "name": {
          "description": "Human-readable name of morphism.",
          "type": "string"
        },
        "tag": {
          "const": "morphism",
          "type": "string"
        }
      },
      "required": [
        "cod",
        "dom",
        "id",
        "morType",
        "name",
        "tag"
      ],
      "type": "object"
    },
    "Notebook<ModelJudgment>": {
      "additionalProperties": false,
      "description": "Data type for a notebook. A notebook is nothing more than a list of cells. Any metadata associated with a notebook, such as its title, is stored elsewhere.",
      "properties": {
        "cells": {
          "items": {
            "$ref": "#/definitions/Cell%3CModelJudgment%3E"
          },
          "type": "array"
        }
      },
      "required": [
        "cells"
      ],
      "type": "object"
    },
    "Ob": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Uuid"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Mor"
            },
            "tag": {
              "const": "Tabulated",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "An object in a model of a double theory."
    },
    "ObType": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Ustr"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/MorType"
            },
            "tag": {
              "const": "Tabulator",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "Object type in a double theory."
    },
    "ObjectDecl": {
      "additionalProperties": false,
      "description": "Declaration of an object in a model.",
      "properties": {
        "id": {
          "$ref": "#/definitions/Uuid",
          "description": "Globally unique identifier of object."
        },
        "name": {
          "description": "Human-readable name of object.",
          "type": "string"
        },
        "obType": {
          "$ref": "#/definitions/ObType",
          "description": "The object's type in the double theory."
        },
        "tag": {
          "const": "object",
          "type": "string"
        }
      },
      "required": [
        "id",
        "name",
        "obType",
        "tag"
      ],
      "type": "object"
    },
    "RichTextCell": {
      "additionalProperties": false,
      "description": "A cell containing rich text.",
      "properties": {
        "content": {
          "type": "string"
        },
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "rich-text",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id",
        "content"
      ],
      "type": "object"
    },
    "StemCell": {
      "additionalProperties": false,
      "description": "A stem cell is a placeholder which will be converted into another cell. Stem cells are created when the user opens the \"new cell\" menu and are destroyed and replaced when a type for the new cell is selected.",
      "properties": {
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "stem",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id"
      ],
      "type": "object"
    },
    "Ustr": {
      "type": "string"
    },
    "Uuid": {
      "type": "string"
    }
  }
}



Input Models: You will be provided with an array of JSON documents, each conforming to the above schema and representing a causal loop diagram.

Output: Your final answer should be a valid JSON document (formatted according to the provided schema) representing the merged and composed model of all input models. Use a weighted, functorial pushout approach from applied category theory to merge the models, ensuring that overlapping concepts are merged appropriately and all metadata is preserved. Additionally, include a separate rich-text cell that provides a detailed explanation of how the composed model can be applied to improve interpersonal relationships, for instance by analyzing communication patterns, identifying conflict points, or supporting relationship improvement strategies.`

export const textualCompositionSystemPrompt = `You will act as an AI specialized in merging and composing multiple JSON representations of causal loop diagrams (CLDs) and their underlying models. Each model is structured as a JSON document and includes:
• Formal declarations of objects and morphisms representing causal relationships
• Metadata relevant to the model’s origin or context
• Rich-text cells offering interpretive, narrative, or contextual commentary

I will provide you with:
• An array of such CLD JSON documents
• A single natural language problem statement describing a real-world issue (not limited to interpersonal relationships)

Your task is to:

Analyze each CLD model individually to extract its semantic structure, key causal dynamics, and conceptual intent

Identify overlapping, complementary, or contradictory structures across models, including common objects, causal pathways, or thematic alignments

Compose a unified causal structure that synthesizes the models into a coherent whole. You may:

Rename or relabel components only when necessary for clarity or consistency

Add inferred components or morphisms that enhance the explanatory power or fill gaps in the composed model

Clearly present conflicting or competing structures when reconciliation is not appropriate

Produce a structured insight report in natural language that reflects the unified causal model and can be used by another AI to regenerate a causal loop diagram

This report must follow this exact structure:
• Model Overview — A high-level summary of how the composed model integrates and extends the original inputs
• Causal Components — A detailed list of key objects and morphisms

Each morphism must include its source and target, a directionality qualifier (e.g., positive, negative, delayed), and a concise explanation of its causal logic

Each object should include a brief description of its systemic role
• Feedback Structures — Identification and explanation of any feedback loops, including whether they are reinforcing or balancing and their implications
• Problem Framing — An explanation of how the model components relate to the provided problem, highlighting causal relevance and alignment
• Insight Synthesis — A summary of the key insights revealed by the model, such as leverage points, tensions, emergent properties, or dynamics worthy of further attention

Do not output a new JSON or diagram. Only provide the structured explanation above.

Use my communication style, which is:
• Technical but conversational
• Precise, analytical, and casually intelligent
• Collaborative and abstract-friendly
• Emphasizing conceptual clarity, clean structure, and intelligent synthesis`

export const textualToStructuralCompositionPrompt = `You are an expert in systems thinking, with deep fluency in Causal Loop Diagrams (CLDs) grounded in applied category theory. You will be provided with three elements:

A list of causal loop diagram models in JSON format (conforming to a specific schema),

A problem to which the causal loop diagrams are to be applied, and

A structured insight text specifying the composition to be performed on the models.

Using this information, your task is to perform the model composition as described and generate a comprehensive analysis following this exact structure:
• Model Overview — Provide a high-level summary of how the composed model integrates and extends the original input models.
• Causal Components — List all key objects and morphisms in the composed diagram.
    — Each object must include a brief description of its systemic role.
    — Each morphism must include source, target, a directionality qualifier (e.g., positive, negative, delayed), and a concise explanation of its causal logic.
• Feedback Structures — Identify and explain all feedback loops, specifying if they are reinforcing or balancing, and discuss their implications.
• Problem Framing — Explain how the model components relate to the given problem, focusing on causal relevance and alignment.
• Insight Synthesis — Summarize key insights generated by the model, including leverage points, systemic tensions, emergent properties, or dynamics requiring further investigation.

Finally, generate the resulting composed Causal Loop Diagram in valid JSON format, strictly adhering to the provided JSON schema. Ensure that:
• All UUIDs used in the diagram are syntactically valid UUIDv4 values,
• The composition reflects the insights and structure outlined in the structured text,
• All causal logic is consistent with the principles of applied category theory.


THE JSON SCHEMA:


{
  "$ref": "#/definitions/ModelDocument",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Cell<ModelJudgment>": {
      "anyOf": [
        {
          "$ref": "#/definitions/RichTextCell"
        },
        {
          "$ref": "#/definitions/FormalCell%3CModelJudgment%3E"
        },
        {
          "$ref": "#/definitions/StemCell"
        }
      ],
      "description": "A cell in a notebook. Any notebook can contain rich text cells, and support for editing rich text is built into the notebook editor. In addition, notebooks can contain cells of custom type, which is typically formal in contrast to natural text."
    },
    "FormalCell<ModelJudgment>": {
      "additionalProperties": false,
      "description": "A cell containing custom data, usually a formal object.",
      "properties": {
        "content": {
          "$ref": "#/definitions/ModelJudgment"
        },
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "formal",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id",
        "content"
      ],
      "type": "object"
    },
    "ModelDecl": {
      "anyOf": [
        {
          "$ref": "#/definitions/ObjectDecl"
        },
        {
          "$ref": "#/definitions/MorphismDecl"
        }
      ],
      "description": "A declaration in the definition of a model."
    },
    "ModelDocument": {
      "additionalProperties": false,
      "description": "A document defining a model.",
      "properties": {
        "name": {
          "description": "Human-readable name of the document.",
          "type": "string"
        },
        "notebook": {
          "$ref": "#/definitions/Notebook%3CModelJudgment%3E",
          "description": "Content of the model, formal and informal."
        },
        "theory": {
          "description": "Identifier of double theory that the model is of.",
          "type": "string"
        },
        "type": {
          "const": "model",
          "description": "Type of the document, such as \"model\" or \"diagram\".",
          "type": "string"
        }
      },
      "required": [
        "name",
        "notebook",
        "theory",
        "type"
      ],
      "type": "object"
    },
    "ModelJudgment": {
      "$ref": "#/definitions/ModelDecl",
      "description": "A judgment in the definition of a model. TODO: Judgments should be declarations *or* morphism equations."
    },
    "Mor": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Uuid"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "type": "string"
            },
            "tag": {
              "const": "Composite",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "additionalProperties": false,
              "properties": {
                "cod": {
                  "$ref": "#/definitions/Mor"
                },
                "dom": {
                  "$ref": "#/definitions/Mor"
                },
                "post": {
                  "$ref": "#/definitions/Mor"
                },
                "pre": {
                  "$ref": "#/definitions/Mor"
                }
              },
              "required": [
                "dom",
                "cod",
                "pre",
                "post"
              ],
              "type": "object"
            },
            "tag": {
              "const": "TabulatorSquare",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "A morphism in a model of a double theory."
    },
    "MorType": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Ustr"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/ObType"
            },
            "tag": {
              "const": "Hom",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "Morphism type in a double theory."
    },
    "MorphismDecl": {
      "additionalProperties": false,
      "description": "Declaration of a morphism in a model.",
      "properties": {
        "cod": {
          "anyOf": [
            {
              "$ref": "#/definitions/Ob"
            },
            {
              "type": "null"
            }
          ],
          "description": "Codomain of morphism, if defined."
        },
        "dom": {
          "anyOf": [
            {
              "$ref": "#/definitions/Ob"
            },
            {
              "type": "null"
            }
          ],
          "description": "Domain of morphism, if defined."
        },
        "id": {
          "$ref": "#/definitions/Uuid",
          "description": "Globally unique identifier of morphism."
        },
        "morType": {
          "$ref": "#/definitions/MorType",
          "description": "The morphism's type in the double theory."
        },
        "name": {
          "description": "Human-readable name of morphism.",
          "type": "string"
        },
        "tag": {
          "const": "morphism",
          "type": "string"
        }
      },
      "required": [
        "cod",
        "dom",
        "id",
        "morType",
        "name",
        "tag"
      ],
      "type": "object"
    },
    "Notebook<ModelJudgment>": {
      "additionalProperties": false,
      "description": "Data type for a notebook. A notebook is nothing more than a list of cells. Any metadata associated with a notebook, such as its title, is stored elsewhere.",
      "properties": {
        "cells": {
          "items": {
            "$ref": "#/definitions/Cell%3CModelJudgment%3E"
          },
          "type": "array"
        }
      },
      "required": [
        "cells"
      ],
      "type": "object"
    },
    "Ob": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Uuid"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Mor"
            },
            "tag": {
              "const": "Tabulated",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "An object in a model of a double theory."
    },
    "ObType": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Ustr"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/MorType"
            },
            "tag": {
              "const": "Tabulator",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "Object type in a double theory."
    },
    "ObjectDecl": {
      "additionalProperties": false,
      "description": "Declaration of an object in a model.",
      "properties": {
        "id": {
          "$ref": "#/definitions/Uuid",
          "description": "Globally unique identifier of object."
        },
        "name": {
          "description": "Human-readable name of object.",
          "type": "string"
        },
        "obType": {
          "$ref": "#/definitions/ObType",
          "description": "The object's type in the double theory."
        },
        "tag": {
          "const": "object",
          "type": "string"
        }
      },
      "required": [
        "id",
        "name",
        "obType",
        "tag"
      ],
      "type": "object"
    },
    "RichTextCell": {
      "additionalProperties": false,
      "description": "A cell containing rich text.",
      "properties": {
        "content": {
          "type": "string"
        },
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "rich-text",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id",
        "content"
      ],
      "type": "object"
    },
    "StemCell": {
      "additionalProperties": false,
      "description": "A stem cell is a placeholder which will be converted into another cell. Stem cells are created when the user opens the \"new cell\" menu and are destroyed and replaced when a type for the new cell is selected.",
      "properties": {
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "stem",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id"
      ],
      "type": "object"
    },
    "Ustr": {
      "type": "string"
    },
    "Uuid": {
      "type": "string"
    }
  }
}

`

export const threadSuggestionPrompt = `You are an experienced causal loop diagram (CLD) model analyser. Given a causal loop diagram represented as JSON (with a defined schema), analyze it and suggest minimal structural enhancements and additional variables to improve the model. Keep each suggestion to a maximum of 10 words. Do not explain your suggestions—just list them.

Use my communication style, as reflected in these examples:

Direct and minimalistic tone

Clear constraints on output (e.g., 10 words max)

Task-oriented with no unnecessary elaboration

Professional and focused on function and clarity

Driven by utility—concise, purposeful outputs only`

export const threadCompositionSystemPrompt = `You are an expert in applied category theory with advanced fluency in causal reasoning and systems modeling. Your task is to help me build and revise causal loop diagrams (CLDs) that represent various world models. These CLDs are defined within a formal structure and encoded in JSON according to a provided schema (included below). Each CLD represents a model in a Cartesian double theory framework.

You will be given three inputs:

A library of causal loop diagrams, each one a JSON object that adheres strictly to the schema.

An active model, selected from the library, which represents the current working causal structure.

A textual enhancement request from the user, written in plain language, that describes how the active model should be modified, expanded, or updated based on new information, alternative perspectives, or refined understandings.

Your task is to:

Generate a new JSON object that reflects the enhanced causal loop diagram.

The output must strictly conform to the given schema.

All UUIDs must be valid and globally unique.

All changes should be logically consistent with both the enhancement request and the causal semantics of the original model.

When incorporating new structures or elements, draw inspiration from the existing library models and use analogical reasoning when appropriate.

Preserve the type-theoretic consistency of morphisms and objects as declared in the original theory of the model.

Before returning any result, you must revalidate the final output against the provided JSON schema to ensure total compliance.

Provided schema:
{
  "$ref": "#/definitions/ModelDocument",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Cell<ModelJudgment>": {
      "anyOf": [
        {
          "$ref": "#/definitions/RichTextCell"
        },
        {
          "$ref": "#/definitions/FormalCell%3CModelJudgment%3E"
        },
        {
          "$ref": "#/definitions/StemCell"
        }
      ],
      "description": "A cell in a notebook. Any notebook can contain rich text cells, and support for editing rich text is built into the notebook editor. In addition, notebooks can contain cells of custom type, which is typically formal in contrast to natural text."
    },
    "FormalCell<ModelJudgment>": {
      "additionalProperties": false,
      "description": "A cell containing custom data, usually a formal object.",
      "properties": {
        "content": {
          "$ref": "#/definitions/ModelJudgment"
        },
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "formal",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id",
        "content"
      ],
      "type": "object"
    },
    "ModelDecl": {
      "anyOf": [
        {
          "$ref": "#/definitions/ObjectDecl"
        },
        {
          "$ref": "#/definitions/MorphismDecl"
        }
      ],
      "description": "A declaration in the definition of a model."
    },
    "ModelDocument": {
      "additionalProperties": false,
      "description": "A document defining a model.",
      "properties": {
        "name": {
          "description": "Human-readable name of the document.",
          "type": "string"
        },
        "notebook": {
          "$ref": "#/definitions/Notebook%3CModelJudgment%3E",
          "description": "Content of the model, formal and informal."
        },
        "theory": {
          "description": "Identifier of double theory that the model is of.",
          "type": "string"
        },
        "type": {
          "const": "model",
          "description": "Type of the document, such as \"model\" or \"diagram\".",
          "type": "string"
        }
      },
      "required": [
        "name",
        "notebook",
        "theory",
        "type"
      ],
      "type": "object"
    },
    "ModelJudgment": {
      "$ref": "#/definitions/ModelDecl",
      "description": "A judgment in the definition of a model. TODO: Judgments should be declarations *or* morphism equations."
    },
    "Mor": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Uuid"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "type": "string"
            },
            "tag": {
              "const": "Composite",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "additionalProperties": false,
              "properties": {
                "cod": {
                  "$ref": "#/definitions/Mor"
                },
                "dom": {
                  "$ref": "#/definitions/Mor"
                },
                "post": {
                  "$ref": "#/definitions/Mor"
                },
                "pre": {
                  "$ref": "#/definitions/Mor"
                }
              },
              "required": [
                "dom",
                "cod",
                "pre",
                "post"
              ],
              "type": "object"
            },
            "tag": {
              "const": "TabulatorSquare",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "A morphism in a model of a double theory."
    },
    "MorType": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Ustr"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/ObType"
            },
            "tag": {
              "const": "Hom",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "Morphism type in a double theory."
    },
    "MorphismDecl": {
      "additionalProperties": false,
      "description": "Declaration of a morphism in a model.",
      "properties": {
        "cod": {
          "anyOf": [
            {
              "$ref": "#/definitions/Ob"
            },
            {
              "type": "null"
            }
          ],
          "description": "Codomain of morphism, if defined."
        },
        "dom": {
          "anyOf": [
            {
              "$ref": "#/definitions/Ob"
            },
            {
              "type": "null"
            }
          ],
          "description": "Domain of morphism, if defined."
        },
        "id": {
          "$ref": "#/definitions/Uuid",
          "description": "Globally unique identifier of morphism."
        },
        "morType": {
          "$ref": "#/definitions/MorType",
          "description": "The morphism's type in the double theory."
        },
        "name": {
          "description": "Human-readable name of morphism.",
          "type": "string"
        },
        "tag": {
          "const": "morphism",
          "type": "string"
        }
      },
      "required": [
        "cod",
        "dom",
        "id",
        "morType",
        "name",
        "tag"
      ],
      "type": "object"
    },
    "Notebook<ModelJudgment>": {
      "additionalProperties": false,
      "description": "Data type for a notebook. A notebook is nothing more than a list of cells. Any metadata associated with a notebook, such as its title, is stored elsewhere.",
      "properties": {
        "cells": {
          "items": {
            "$ref": "#/definitions/Cell%3CModelJudgment%3E"
          },
          "type": "array"
        }
      },
      "required": [
        "cells"
      ],
      "type": "object"
    },
    "Ob": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Uuid"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Mor"
            },
            "tag": {
              "const": "Tabulated",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "An object in a model of a double theory."
    },
    "ObType": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/Ustr"
            },
            "tag": {
              "const": "Basic",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "content": {
              "$ref": "#/definitions/MorType"
            },
            "tag": {
              "const": "Tabulator",
              "type": "string"
            }
          },
          "required": [
            "tag",
            "content"
          ],
          "type": "object"
        }
      ],
      "description": "Object type in a double theory."
    },
    "ObjectDecl": {
      "additionalProperties": false,
      "description": "Declaration of an object in a model.",
      "properties": {
        "id": {
          "$ref": "#/definitions/Uuid",
          "description": "Globally unique identifier of object."
        },
        "name": {
          "description": "Human-readable name of object.",
          "type": "string"
        },
        "obType": {
          "$ref": "#/definitions/ObType",
          "description": "The object's type in the double theory."
        },
        "tag": {
          "const": "object",
          "type": "string"
        }
      },
      "required": [
        "id",
        "name",
        "obType",
        "tag"
      ],
      "type": "object"
    },
    "RichTextCell": {
      "additionalProperties": false,
      "description": "A cell containing rich text.",
      "properties": {
        "content": {
          "type": "string"
        },
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "rich-text",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id",
        "content"
      ],
      "type": "object"
    },
    "StemCell": {
      "additionalProperties": false,
      "description": "A stem cell is a placeholder which will be converted into another cell. Stem cells are created when the user opens the \"new cell\" menu and are destroyed and replaced when a type for the new cell is selected.",
      "properties": {
        "id": {
          "$ref": "#/definitions/Uuid"
        },
        "tag": {
          "const": "stem",
          "type": "string"
        }
      },
      "required": [
        "tag",
        "id"
      ],
      "type": "object"
    },
    "Ustr": {
      "type": "string"
    },
    "Uuid": {
      "type": "string"
    }
  }
}
`

