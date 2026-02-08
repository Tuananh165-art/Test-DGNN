# File: delivery_optimizer.py

import numpy as np
import heapq
from typing import List, Tuple, Dict
import matplotlib.pyplot as plt
import plotly.graph_objects as go
from dataclasses import dataclass

@dataclass
class Order:
    id: int
    pickup: Tuple[int, int]
    delivery: Tuple[int, int]
    weight: float

@dataclass
class Vehicle:
    position: Tuple[int, int]
    capacity: float
    fuel_capacity: float
    fuel_consumption: float = 0.05  # 1 lít/20 ô
    current_fuel: float = None
    current_load: float = 0.0
    
    def __post_init__(self):
        if self.current_fuel is None:
            self.current_fuel = self.fuel_capacity

class DeliveryOptimizer:
    def __init__(self, grid_size: Tuple[int, int], 
                 vehicle: Vehicle, 
                 orders: List[Order],
                 gas_stations: List[Tuple[int, int]]):
        self.n, self.m = grid_size
        self.vehicle = vehicle
        self.orders = orders
        self.gas_stations = gas_stations
        self.route = []
        
    def manhattan_distance(self, p1: Tuple[int, int], p2: Tuple[int, int]) -> int:
        return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])
    
    def a_star(self, start: Tuple[int, int], goal: Tuple[int, int]) -> List[Tuple[int, int]]:
        """A* pathfinding algorithm"""
        def heuristic(pos):
            return self.manhattan_distance(pos, goal)
        
        open_set = [(0, start)]
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic(start)}
        
        while open_set:
            current = heapq.heappop(open_set)[1]
            
            if current == goal:
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(start)
                return path[::-1]
            
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                neighbor = (current[0] + dx, current[1] + dy)
                
                if not (0 <= neighbor[0] < self.n and 0 <= neighbor[1] < self.m):
                    continue
                
                tentative_g = g_score[current] + 1
                
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))
        
        return []
    
    def find_nearest_gas_station(self, position: Tuple[int, int]) -> Tuple[int, int]:
        """Tìm trạm xăng gần nhất"""
        return min(self.gas_stations, 
                   key=lambda station: self.manhattan_distance(position, station))
    
    def calculate_fuel_needed(self, distance: int) -> float:
        """Tính nhiên liệu cần cho quãng đường"""
        return distance * self.vehicle.fuel_consumption
    
    def can_reach(self, from_pos: Tuple[int, int], to_pos: Tuple[int, int]) -> bool:
        """Kiểm tra xe có thể đến đích với nhiên liệu hiện tại"""
        distance = self.manhattan_distance(from_pos, to_pos)
        fuel_needed = self.calculate_fuel_needed(distance)
        return self.vehicle.current_fuel >= fuel_needed
    
    def optimize_route_greedy(self) -> List[Dict]:
        """
        Greedy algorithm với ưu tiên:
        1. Capacity constraint
        2. Fuel constraint
        3. Shortest distance first
        """
        route = []
        current_pos = self.vehicle.position
        remaining_orders = self.orders.copy()
        picked_orders = []
        trip_number = 1
        
        route.append({
            'type': 'start',
            'position': current_pos,
            'trip': trip_number,
            'fuel': self.vehicle.current_fuel,
            'load': 0
        })
        
        while remaining_orders or picked_orders:
            # Phase 1: Pickup phase
            while remaining_orders:
                # Tìm order gần nhất có thể lấy
                feasible_orders = [
                    order for order in remaining_orders 
                    if self.vehicle.current_load + order.weight <= self.vehicle.capacity
                ]
                
                if not feasible_orders:
                    break
                
                # Chọn order gần nhất
                next_order = min(feasible_orders,
                                key=lambda o: self.manhattan_distance(current_pos, o.pickup))
                
                # Kiểm tra nhiên liệu
                if not self.can_reach(current_pos, next_order.pickup):
                    # Cần đổ xăng
                    nearest_station = self.find_nearest_gas_station(current_pos)
                    if self.can_reach(current_pos, nearest_station):
                        path = self.a_star(current_pos, nearest_station)
                        distance = len(path) - 1
                        
                        route.append({
                            'type': 'refuel',
                            'position': nearest_station,
                            'trip': trip_number,
                            'distance': distance,
                            'fuel_before': self.vehicle.current_fuel,
                            'load': self.vehicle.current_load
                        })
                        
                        self.vehicle.current_fuel -= self.calculate_fuel_needed(distance)
                        self.vehicle.current_fuel = self.vehicle.fuel_capacity
                        current_pos = nearest_station
                    else:
                        raise Exception("Cannot reach any gas station!")
                
                # Di chuyển đến pickup
                path = self.a_star(current_pos, next_order.pickup)
                distance = len(path) - 1
                fuel_used = self.calculate_fuel_needed(distance)
                
                self.vehicle.current_fuel -= fuel_used
                self.vehicle.current_load += next_order.weight
                
                route.append({
                    'type': 'pickup',
                    'order_id': next_order.id,
                    'position': next_order.pickup,
                    'trip': trip_number,
                    'distance': distance,
                    'fuel': self.vehicle.current_fuel,
                    'load': self.vehicle.current_load,
                    'weight': next_order.weight
                })
                
                current_pos = next_order.pickup
                remaining_orders.remove(next_order)
                picked_orders.append(next_order)
            
            # Phase 2: Delivery phase
            while picked_orders:
                # Chọn delivery gần nhất
                next_order = min(picked_orders,
                                key=lambda o: self.manhattan_distance(current_pos, o.delivery))
                
                # Kiểm tra nhiên liệu
                if not self.can_reach(current_pos, next_order.delivery):
                    nearest_station = self.find_nearest_gas_station(current_pos)
                    path = self.a_star(current_pos, nearest_station)
                    distance = len(path) - 1
                    
                    route.append({
                        'type': 'refuel',
                        'position': nearest_station,
                        'trip': trip_number,
                        'distance': distance,
                        'fuel_before': self.vehicle.current_fuel,
                        'load': self.vehicle.current_load
                    })
                    
                    self.vehicle.current_fuel -= self.calculate_fuel_needed(distance)
                    self.vehicle.current_fuel = self.vehicle.fuel_capacity
                    current_pos = nearest_station
                
                # Di chuyển đến delivery
                path = self.a_star(current_pos, next_order.delivery)
                distance = len(path) - 1
                fuel_used = self.calculate_fuel_needed(distance)
                
                self.vehicle.current_fuel -= fuel_used
                self.vehicle.current_load -= next_order.weight
                
                route.append({
                    'type': 'delivery',
                    'order_id': next_order.id,
                    'position': next_order.delivery,
                    'trip': trip_number,
                    'distance': distance,
                    'fuel': self.vehicle.current_fuel,
                    'load': self.vehicle.current_load,
                    'weight': next_order.weight
                })
                
                current_pos = next_order.delivery
                picked_orders.remove(next_order)
            
            # Nếu còn orders, quay về start cho trip mới
            if remaining_orders:
                if not self.can_reach(current_pos, self.vehicle.position):
                    nearest_station = self.find_nearest_gas_station(current_pos)
                    path = self.a_star(current_pos, nearest_station)
                    distance = len(path) - 1
                    
                    route.append({
                        'type': 'refuel',
                        'position': nearest_station,
                        'trip': trip_number,
                        'distance': distance,
                        'fuel_before': self.vehicle.current_fuel,
                        'load': self.vehicle.current_load
                    })
                    
                    self.vehicle.current_fuel -= self.calculate_fuel_needed(distance)
                    self.vehicle.current_fuel = self.vehicle.fuel_capacity
                    current_pos = nearest_station
                
                path = self.a_star(current_pos, self.vehicle.position)
                distance = len(path) - 1
                
                route.append({
                    'type': 'return',
                    'position': self.vehicle.position,
                    'trip': trip_number,
                    'distance': distance,
                    'fuel': self.vehicle.current_fuel - self.calculate_fuel_needed(distance),
                    'load': 0
                })
                
                current_pos = self.vehicle.position
                self.vehicle.current_fuel = self.vehicle.fuel_capacity
                trip_number += 1
        
        # Return về điểm xuất phát cuối cùng
        if current_pos != self.vehicle.position:
            path = self.a_star(current_pos, self.vehicle.position)
            distance = len(path) - 1
            
            route.append({
                'type': 'final_return',
                'position': self.vehicle.position,
                'trip': trip_number,
                'distance': distance,
                'fuel': self.vehicle.current_fuel - self.calculate_fuel_needed(distance),
                'load': 0
            })
        
        self.route = route
        return route
    
    def calculate_metrics(self) -> Dict:
        """Tính toán các metrics"""
        total_distance = sum(step.get('distance', 0) for step in self.route)
        refuel_count = sum(1 for step in self.route if step['type'] == 'refuel')
        trips = max(step['trip'] for step in self.route)
        
        return {
            'total_distance': total_distance,
            'refuel_count': refuel_count,
            'trips': trips,
            'total_steps': len(self.route)
        }
    
    def visualize_route(self, save_path='route_visualization.html'):
        """Tạo visualization với Plotly"""
        fig = go.Figure()
        
        # Grid background
        fig.add_trace(go.Scatter(
            x=[i for i in range(self.m) for _ in range(self.n)],
            y=[j for _ in range(self.m) for j in range(self.n)],
            mode='markers',
            marker=dict(size=3, color='lightgray'),
            name='Grid',
            showlegend=False
        ))
        
        # Gas stations
        gas_x = [station[1] for station in self.gas_stations]
        gas_y = [station[0] for station in self.gas_stations]
        fig.add_trace(go.Scatter(
            x=gas_x, y=gas_y,
            mode='markers',
            marker=dict(size=15, symbol='square', color='green'),
            name='Gas Stations',
            text=['Gas Station'] * len(self.gas_stations)
        ))
        
        # Orders
        for order in self.orders:
            # Pickup
            fig.add_trace(go.Scatter(
                x=[order.pickup[1]], y=[order.pickup[0]],
                mode='markers+text',
                marker=dict(size=12, symbol='circle', color='blue'),
                text=[f'P{order.id}'],
                textposition='top center',
                name=f'Pickup {order.id}',
                showlegend=False
            ))
            # Delivery
            fig.add_trace(go.Scatter(
                x=[order.delivery[1]], y=[order.delivery[0]],
                mode='markers+text',
                marker=dict(size=12, symbol='circle', color='red'),
                text=[f'D{order.id}'],
                textposition='top center',
                name=f'Delivery {order.id}',
                showlegend=False
            ))
        
        # Route path
        route_x = []
        route_y = []
        for step in self.route:
            route_x.append(step['position'][1])
            route_y.append(step['position'][0])
        
        fig.add_trace(go.Scatter(
            x=route_x, y=route_y,
            mode='lines+markers',
            line=dict(color='orange', width=2),
            marker=dict(size=8, color='orange'),
            name='Route'
        ))
        
        # Start point
        fig.add_trace(go.Scatter(
            x=[self.vehicle.position[1]], y=[self.vehicle.position[0]],
            mode='markers+text',
            marker=dict(size=20, symbol='star', color='gold'),
            text=['START'],
            textposition='top center',
            name='Start'
        ))
        
        fig.update_layout(
            title='Delivery Route Visualization',
            xaxis_title='X',
            yaxis_title='Y',
            hovermode='closest',
            width=1000,
            height=1000
        )
        
        fig.write_html(save_path)
        print(f"Visualization saved to {save_path}")
        
        return fig
    
    def print_route(self):
        """In ra lộ trình chi tiết"""
        print("=" * 80)
        print("DELIVERY ROUTE PLAN")
        print("=" * 80)
        
        for i, step in enumerate(self.route, 1):
            print(f"\nStep {i}:")
            print(f"  Type: {step['type'].upper()}")
            print(f"  Position: {step['position']}")
            print(f"  Trip: {step['trip']}")
            
            if 'distance' in step:
                print(f"  Distance: {step['distance']} units")
            if 'fuel' in step:
                print(f"  Fuel: {step['fuel']:.2f} liters")
            if 'load' in step:
                print(f"  Load: {step['load']:.2f} kg")
            if 'weight' in step:
                print(f"  Weight: {step['weight']:.2f} kg")
        
        print("\n" + "=" * 80)
        print("SUMMARY METRICS")
        print("=" * 80)
        metrics = self.calculate_metrics()
        for key, value in metrics.items():
            print(f"  {key}: {value}")
        print("=" * 80)


# Example usage
def main():
    # Setup
    grid_size = (10, 10)
    
    vehicle = Vehicle(
        position=(2, 3),
        capacity=50,
        fuel_capacity=30
    )
    
    orders = [
        Order(id=1, pickup=(3, 5), delivery=(8, 7), weight=20),
        Order(id=2, pickup=(1, 8), delivery=(6, 2), weight=15),
        Order(id=3, pickup=(7, 4), delivery=(9, 9), weight=10)
    ]
    
    gas_stations = [(4, 9), (9, 1)]
    
    # Optimize
    optimizer = DeliveryOptimizer(grid_size, vehicle, orders, gas_stations)
    route = optimizer.optimize_route_greedy()
    
    # Output
    optimizer.print_route()
    optimizer.visualize_route('delivery_route.html')
    
    print("\n✓ Route optimization completed!")
    print("✓ Visualization saved to delivery_route.html")


if __name__ == "__main__":
    main()