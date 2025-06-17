import { asTuple } from "@/app/types/tuple";

describe("asTuple", () => {
  it("should make a tuple from an array", () => {
    const tuple = asTuple(["a", 1, true]);

    // assign to variables to test correct tuple types
    const str: string = tuple[0];
    const int: number = tuple[1];
    const bool: boolean = tuple[2];

    expect(str).toEqual("a");
    expect(int).toEqual(1);
    expect(bool).toEqual(true);
  });
});
