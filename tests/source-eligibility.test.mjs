import assert from "node:assert/strict";
import test from "node:test";
import { answer } from "../dist/app.js";

test("active policy source takes precedence over an earlier archived source", () => {
  let modelCalls = 0;
  const result = answer({ kind: "policy", topic: "exchange" }, {
    documents: [
      {
        id: "exchange-archived",
        revision: "1",
        topic: "exchange",
        state: "archived",
        text: "Exchange window: 30 days."
      },
      {
        id: "exchange-active",
        revision: "2",
        topic: "exchange",
        state: "active",
        text: "Exchange window: 14 days."
      }
    ],
    lookup: () => undefined,
    model: source => {
      modelCalls++;
      return `Policy: ${source.text}`;
    }
  });

  assert.equal(result.status, "ok");
  assert.equal(result.text, "Policy: Exchange window: 14 days.");
  assert.deepEqual(result.citations, ["exchange-active"]);
  assert.ok(result.trace.some(event =>
    event.stage === "retrieval" && event.sourceId === "exchange-active" && event.revision === "2"
  ));
  assert.equal(modelCalls, 1);
});

test("archived-only policy topic is refused without model execution", () => {
  let modelCalls = 0;
  const result = answer({ kind: "policy", topic: "retired-product" }, {
    documents: [
      {
        id: "retired-product-archived",
        revision: "1",
        topic: "retired-product",
        state: "archived",
        text: "Retired product remains available."
      }
    ],
    lookup: () => undefined,
    model: source => {
      modelCalls++;
      return `Policy: ${source.text}`;
    }
  });

  assert.equal(result.status, "refused");
  assert.deepEqual(result.citations, []);
  assert.equal(modelCalls, 0);
});
