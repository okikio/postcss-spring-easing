/*!
 * Based off of https://github.com/jakearchibald/linear-easing-generator
 *
 * Changes:
 * - Added comments and docs top explain logic
 * - Switched to iterative approach for the `ramerDouglasPeucker` algorithim
 * - Renamed functions, parameters and variables to improve readability and to better match a library usecase
 *
 * Copyright 2023 Jake Archibald [@jakearchibald](https://github.com/jakearchibald)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * The function calculates the squared distance from a point to a line segment.
 * Using squared distances avoids costly square root operations and doesn't
 * affect the result because we're only interested in relative distances.
 *
 * @param point The point from which distance is to be measured
 * @param lineStart The start point of the line segment
 * @param lineEnd The end point of the line segment
 * @returns The squared distance from the point to the line segment
 */
export declare function squaredSegmentDistance(point: [number, number], lineStart: [number, number], lineEnd: [number, number]): number;
/**
 * Simplify a line given an array of points and a tolerance using the Ramer-Douglas-Peucker algorithm.
 * The tolerance determines the maximum allowed perpendicular distance from a point to the line segment
 * connecting its neighboring points. Points with a greater distance are included in the simplified line,
 * while points with a smaller distance are excluded.
 *
 * This version of the function uses an iterative approach with a stack instead of recursion.
 *
 * The iterative approach using a stack doesn't guarantee that the points will be processed in the same
 * order as the recursive approach. Because of the way points are pushed onto the stack,
 * the algorithm could sometimes process points out of order.
 *
 * To fix this before returning the final result we sort the
 * simplified points in increasing order of x values before returning them.
 *
 * @param points The array of points to be simplified
 * @param tolerance The maximum allowed perpendicular distance from a point to the line segment
 *                  connecting its neighboring points
 * @returns The simplified line as an array of points, it sorts the simplified points in increasing order of x values before returning them.
 */
export declare function ramerDouglasPeucker(points: [number, number][], tolerance: number): [number, number][];
/**
 * Simplifies a given set of points using the Ramer-Douglas-Peucker algorithm and
 * rounds the x and y values of the resulting points.
 *
 * @param fullPoints - The array of points to be simplified. Each point is represented as a pair of numbers: [pos, val].
 * @param simplify - The maximum allowed perpendicular distance from a point to the line segment.
 * @param round - The number of decimal places to which point values should be rounded.
 *
 * @returns The simplified and rounded points, or null if the input was null.
 *
 * The function first checks if the input points are null. If they are, it returns null.
 * If they are not null, the function applies the Ramer-Douglas-Peucker algorithm to the points using the specified tolerance.
 * Then it rounds the x and y values of the resulting points to the specified number of decimal places.
 * The x values are always rounded to at least 2 decimal places because they are represented as a percentage.
 */
export declare function getOptimizedPoints(fullPoints: [x: number, y: number][] | null, simplify: number, round: number): [x: number, y: number][] | null;
//# sourceMappingURL=optimize.d.ts.map